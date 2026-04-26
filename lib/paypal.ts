const BASE_URL = "https://api-m.sandbox.paypal.com"; // switch to api-m.paypal.com for production

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
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

export async function createPayPalOrder(
  total: number,
  currency = "AUD"
): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
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

  if (!res.ok) throw new Error("Failed to create PayPal order");
  const data = await res.json();
  return data.id;
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to capture PayPal order");
  const data = await res.json();

  if (data.status !== "COMPLETED") {
    throw new Error(`Payment not completed. Status: ${data.status}`);
  }

  return data;
}
