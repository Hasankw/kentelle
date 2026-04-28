import { Resend } from "resend";

export async function sendGiftCard(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  amount: number,
  code: string,
  message: string
) {
  const resend = getResend();
  const displayName = recipientName || recipientEmail.split("@")[0];
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: recipientEmail,
    subject: `You received a $${amount.toFixed(2)} Kentelle Gift Card!`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h1 style="color:#1B2A4A;font-size:24px;margin-bottom:8px;">You've received a gift card! 🎁</h1>
        <p style="color:#444;font-size:15px;">Hi ${displayName},</p>
        <p style="color:#444;font-size:15px;">${senderName} sent you a Kentelle Skincare gift card worth <strong>$${amount.toFixed(2)} AUD</strong>.</p>
        ${message ? `<p style="color:#666;font-style:italic;border-left:3px solid #3DECC2;padding-left:12px;">"${message}"</p>` : ""}
        <div style="background:#f5f5f5;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
          <p style="color:#888;font-size:12px;margin:0 0 6px;">Your gift card code</p>
          <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#1B2A4A;margin:0;">${code}</p>
          <p style="color:#888;font-size:12px;margin:8px 0 0;">Valid amount: $${amount.toFixed(2)} AUD</p>
        </div>
        <p style="color:#444;font-size:14px;">Redeem this code at <a href="https://kentelle.com/cart" style="color:#3DECC2;">kentelle.com/cart</a> on your next purchase.</p>
        <p style="color:#888;font-size:12px;margin-top:24px;">— Kentelle Skincare Team</p>
      </div>
    `,
  });
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

interface OrderItem {
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  items: OrderItem[],
  total: number
) {
  const itemRows = items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>x${item.quantity}</td><td>$${(item.price * item.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  await getResend().emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order number: <strong>${orderNumber}</strong></p>
      <table>${itemRows}</table>
      <p><strong>Total: $${total.toFixed(2)} AUD</strong></p>
      <p>We'll be in touch when your order ships.</p>
      <p>— Kentelle Skincare</p>
    `,
  });
}
