import { db } from "@/lib/db";

async function getPayPalCredentials(): Promise<{ clientId: string; secret: string; sandbox: boolean }> {
  try {
    const rows = await db.content.findMany({
      where: { key: { in: ["paypal_client_id", "paypal_secret", "paypal_mode"] } },
    });
    const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
    if (s.paypal_client_id && s.paypal_secret) {
      return {
        clientId: s.paypal_client_id,
        secret: s.paypal_secret,
        sandbox: (s.paypal_mode ?? "sandbox") !== "live",
      };
    }
  } catch { /* fall through to env */ }

  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");
  return { clientId, secret, sandbox: true };
}

async function getAccessToken(): Promise<string> {
  const { clientId, secret, sandbox } = await getPayPalCredentials();
  const baseUrl = sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Failed to get PayPal access token");
  const data = await res.json();
  return data.access_token;
}

async function getBaseUrl(): Promise<string> {
  const { sandbox } = await getPayPalCredentials();
  return sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
}

export async function createPayPalOrder(total: number, currency = "AUD"): Promise<string> {
  const [token, baseUrl] = await Promise.all([getAccessToken(), getBaseUrl()]);

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: total.toFixed(2),
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to create PayPal order");
  }
  const data = await res.json();
  return data.id;
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const [token, baseUrl] = await Promise.all([getAccessToken(), getBaseUrl()]);

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to capture PayPal order");
  const data = await res.json();

  if (data.status !== "COMPLETED") {
    return { success: false, captureId: null };
  }

  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
  return { success: true, captureId };
}
