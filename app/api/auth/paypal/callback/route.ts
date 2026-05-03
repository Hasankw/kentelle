import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/admin/payments?paypal_error=access_denied", req.url)
    );
  }

  const rows = await db.content.findMany({
    where: { key: { in: ["paypal_client_id", "paypal_secret", "paypal_mode"] } },
  });
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));

  const clientId = s.paypal_client_id ?? "";
  const secret = s.paypal_secret ?? "";
  const isSandbox = (s.paypal_mode ?? "sandbox") !== "live";
  const apiBase = isSandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kentelle.vercel.app"}/api/auth/paypal/callback`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error("No access token received");
    }

    // Get merchant info
    const userRes = await fetch(
      `${apiBase}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const userInfo = await userRes.json();

    const email = userInfo.emails?.[0]?.value ?? userInfo.payer_id ?? "connected";

    // Save merchant info
    await Promise.all([
      db.content.upsert({
        where: { key: "paypal_merchant_email" },
        create: { key: "paypal_merchant_email", value: email },
        update: { value: email },
      }),
      db.content.upsert({
        where: { key: "paypal_connected" },
        create: { key: "paypal_connected", value: "true" },
        update: { value: "true" },
      }),
    ]);

    return NextResponse.redirect(
      new URL(`/admin/payments?paypal_connected=${encodeURIComponent(email)}`, req.url)
    );
  } catch (err) {
    console.error("PayPal OAuth error:", err);
    return NextResponse.redirect(
      new URL("/admin/payments?paypal_error=token_exchange_failed", req.url)
    );
  }
}
