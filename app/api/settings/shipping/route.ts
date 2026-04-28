import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.content.findMany({
    where: { key: { in: ["shipping_type", "shipping_rate", "free_shipping_threshold"] } },
  });
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
  return NextResponse.json({
    type: (s.shipping_type as string) ?? "threshold",
    rate: parseFloat(s.shipping_rate ?? "9.95"),
    threshold: parseFloat(s.free_shipping_threshold ?? "80"),
  });
}
