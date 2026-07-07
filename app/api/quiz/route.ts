import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuizResultEmail } from "@/lib/resend";

const ALLOWED = {
  middaySkin: ["oily", "dry", "normal"],
  breakouts: ["often", "sometimes", "rarely"],
  sensitivity: ["very", "sometimes", "no"],
  experience: ["beginner", "advanced"],
  concern: ["oil", "dryness", "acne", "redness"],
} as const;

type Answers = { [K in keyof typeof ALLOWED]: string };

// Branching rules, checked top to bottom. Slugs point at existing
// admin-managed Routine pages — repoint here if dedicated quiz
// routines are created later in Admin → Routines.
function resolveRoutineSlug(a: Answers): string {
  if (a.breakouts === "often" && a.experience === "advanced") return "acne-vulgaris";
  if (a.middaySkin === "oily" && a.sensitivity !== "very" && a.experience === "beginner") return "oily-skin";
  if (a.middaySkin === "dry" || a.concern === "dryness") return "skin-nutrients";
  if (a.sensitivity === "very" || a.concern === "redness") return "acne-rosacea";
  if (a.breakouts === "often" || a.concern === "acne") return "acne-vulgaris";
  return "everyday-essential";
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  for (const [field, options] of Object.entries(ALLOWED)) {
    if (!(options as readonly string[]).includes(body[field])) {
      return NextResponse.json({ error: `Invalid answer for ${field}` }, { status: 400 });
    }
  }

  const email: string | null =
    typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
      ? body.email.trim().toLowerCase()
      : null;

  const answers: Answers = {
    middaySkin: body.middaySkin,
    breakouts: body.breakouts,
    sensitivity: body.sensitivity,
    experience: body.experience,
    concern: body.concern,
  };

  const slug = resolveRoutineSlug(answers);
  const routine = (await db.routine
    .findUnique({ where: { slug } })
    .catch(() => null)) as { title: string; published: boolean } | null;

  const redirect = routine?.published ? `/routines/${slug}` : "/routines";
  const resultTitle = routine?.published ? routine.title : "Kentelle Routines";

  let submission: any = null;
  try {
    submission = await db.quizSubmission.create({
      data: { email, ...answers, resultSlug: slug, resultTitle },
    });
  } catch (e) {
    console.error("quiz submission save failed:", e);
  }

  if (email) {
    const concernLabels: Record<string, string> = {
      oil: "shine & oil control",
      dryness: "dryness & flaking",
      acne: "acne & congestion",
      redness: "redness & irritation",
    };
    try {
      await sendQuizResultEmail(email, resultTitle, `https://kentelle.com${redirect}`, {
        middaySkin: answers.middaySkin,
        concern: concernLabels[answers.concern] ?? answers.concern,
      });
      if (submission) {
        await db.quizSubmission.update({ where: { id: submission.id }, data: { emailSent: true } });
      }
    } catch (e) {
      console.error("quiz result email failed:", e);
    }
  }

  return NextResponse.json({ redirect, title: resultTitle });
}
