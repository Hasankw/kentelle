import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [productCount, reviewCount, categoryCount] = await Promise.all([
      db.product.count(),
      db.review.count(),
      db.category.count(),
    ]);
    return NextResponse.json({ ok: true, productCount, reviewCount, categoryCount });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}
