import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await db.subscriber.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  return NextResponse.redirect(
    new URL("/?subscribed=1", req.url),
    { status: 303 }
  );
}
