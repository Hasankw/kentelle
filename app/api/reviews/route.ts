import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { name, rating, body, productName } = await request.json();

  if (!name || !body || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await db.review.create({
    data: {
      customerName: String(name).slice(0, 100),
      rating: Math.round(Number(rating)),
      body: String(body).slice(0, 2000),
      productName: productName ? String(productName).slice(0, 200) : null,
      approved: false,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
