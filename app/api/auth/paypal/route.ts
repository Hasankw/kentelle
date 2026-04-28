import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Redirect admin to PayPal OAuth consent screen
export async function GET() {
  const rows = await db.content.findMany({
    where: { key: { in: ["paypal_client_id", "paypal_mode"] } },
  });
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));

  const clientId = s.paypal_client_id ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  if (!clientId) {
    return NextResponse.json(
      { error: "PayPal Client ID not configured. Add it in Admin → Payments first." },
      { status: 400 }
    );
  }

  const isSandbox = (s.paypal_mode ?? "sandbox") !== "live";
  const baseUrl = isSandbox
    ? "https://www.sandbox.paypal.com"
    : "https://www.paypal.com";

  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"}/api/auth/paypal/callback`
  );

  const scope = encodeURIComponent("openid profile email https://uri.paypal.com/services/paypalattributes");

  const url = `${baseUrl}/signin/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;

  return NextResponse.redirect(url);
}
