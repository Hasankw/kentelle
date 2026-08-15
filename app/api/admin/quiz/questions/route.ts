import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Options come as a flat array on the payload: [{ value, label, note,
// productIds, flags }]. On create/update we fully replace the option set —
// simplest model for a nested admin editor (add/remove/reorder in the UI,
// save the whole question in one call).
export async function GET(req: NextRequest) {
  const poolKey = req.nextUrl.searchParams.get("poolKey");
  const questions = await db.quizQuestion.findMany({
    where: poolKey ? { poolKey } : {},
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question = await db.quizQuestion.create({
    data: {
      poolKey: body.poolKey,
      prompt: body.prompt,
      subtitle: body.subtitle || null,
      why: body.why || null,
      type: body.type ?? "single",
      placeholder: body.placeholder || null,
      sortOrder: body.sortOrder ?? 0,
      enabled: body.enabled ?? true,
      options: (body.options ?? []).map((o: any) => ({
        value: o.value,
        label: o.label,
        note: o.note || null,
        productIds: o.productIds ?? [],
        flags: o.flags ?? [],
      })),
    },
  });
  return NextResponse.json(question);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, options, ...rest } = body;
  const data: any = { ...rest };
  if (options) {
    data.options = options.map((o: any) => ({
      value: o.value,
      label: o.label,
      note: o.note || null,
      productIds: o.productIds ?? [],
      flags: o.flags ?? [],
    }));
  }
  const question = await db.quizQuestion.update({ where: { id }, data });
  return NextResponse.json(question);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.quizQuestion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
