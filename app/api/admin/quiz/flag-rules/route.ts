import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rules = await db.quizFlagRule.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rule = await db.quizFlagRule.create({
    data: {
      flag: body.flag,
      label: body.label,
      excludesTag: body.excludesTag || null,
      substituteProductId: body.substituteProductId || null,
      note: body.note || null,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(rule);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const rule = await db.quizFlagRule.update({ where: { id }, data });
  return NextResponse.json(rule);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.quizFlagRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
