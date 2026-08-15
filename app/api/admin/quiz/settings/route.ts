import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const settings = await db.quizSettings.find();
  return NextResponse.json(
    settings ?? {
      coreCleanserId: null,
      coreTonerId: null,
      coreTreatmentId: null,
      coreMoisturiserId: null,
      maxTreatments: 5,
    }
  );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const settings = await db.quizSettings.update({
    data: {
      coreCleanserId: body.coreCleanserId || null,
      coreTonerId: body.coreTonerId || null,
      coreTreatmentId: body.coreTreatmentId || null,
      coreMoisturiserId: body.coreMoisturiserId || null,
      maxTreatments: body.maxTreatments ?? 5,
    },
  });
  return NextResponse.json(settings);
}
