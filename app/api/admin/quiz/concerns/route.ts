import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const concerns = await db.quizConcern.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(concerns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const concern = await db.quizConcern.create({
    data: {
      key: body.key,
      label: body.label,
      note: body.note || null,
      poolKey: body.poolKey,
      sortOrder: body.sortOrder ?? 0,
      enabled: body.enabled ?? true,
    },
  });
  return NextResponse.json(concern);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const concern = await db.quizConcern.update({ where: { id }, data });
  return NextResponse.json(concern);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.quizConcern.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
