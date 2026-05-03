import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kentelle Skincare</title></head>
<body style="margin:0;padding:0;background:#FAF8F7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F7;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:#3A3240;padding:32px 40px;text-align:center;border-radius:4px 4px 0 0;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B5C9C5;font-family:Arial,sans-serif;">Science-Backed Skincare</p>
        <h1 style="margin:0;font-size:32px;letter-spacing:10px;text-transform:uppercase;color:#ffffff;font-family:Arial,sans-serif;font-weight:bold;">KENTELLE</h1>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#ffffff;padding:0;">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#3A3240;padding:24px 40px;text-align:center;border-radius:0 0 4px 4px;">
        <p style="margin:0 0 8px;color:#ffffff;font-size:13px;font-family:Arial,sans-serif;">Kentelle Skincare &mdash; Made for Australian Skin</p>
        <p style="margin:0;color:#B5C9C5;font-size:11px;font-family:Arial,sans-serif;">
          <a href="https://kentelle.vercel.app" style="color:#B5C9C5;text-decoration:none;">kentelle.vercel.app</a>
          &nbsp;&bull;&nbsp;
          <a href="mailto:support@kentelle.com" style="color:#B5C9C5;text-decoration:none;">support@kentelle.com</a>
        </p>
        <p style="margin:8px 0 0;color:#9B8FA0;font-size:10px;font-family:Arial,sans-serif;">
          All products are intended for cosmetic use only. Not registered as therapeutic goods with the TGA.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Gift Card Email ────────────────────────────────────────────────────────

export async function sendGiftCard(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  amount: number,
  code: string,
  message: string
) {
  const displayName = recipientName || recipientEmail.split("@")[0];
  const html = emailWrapper(`
    <div style="padding:40px 40px 0;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B5C9C5;font-family:Arial,sans-serif;">Gift Card</p>
      <h2 style="margin:0 0 16px;font-size:24px;color:#3A3240;font-family:Arial,sans-serif;">You've received a gift! 🎁</h2>
      <p style="margin:0 0 8px;font-size:15px;color:#444;font-family:Arial,sans-serif;">Hi <strong>${displayName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:15px;color:#444;font-family:Arial,sans-serif;">
        <strong>${senderName}</strong> sent you a Kentelle Skincare gift card worth <strong>$${amount.toFixed(2)} AUD</strong>.
      </p>
      ${message ? `<div style="border-left:3px solid #D4A5B5;padding:12px 16px;margin:0 0 24px;background:#FDF5F8;">
        <p style="margin:0;font-size:14px;color:#555;font-style:italic;font-family:Arial,sans-serif;">&ldquo;${message}&rdquo;</p>
      </div>` : ""}
    </div>

    <div style="margin:0 40px 32px;background:#F5EEF3;border-radius:4px;padding:28px;text-align:center;border:1px solid #E8D8E8;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9B8FA0;font-family:Arial,sans-serif;">Your Gift Card Code</p>
      <p style="margin:0 0 8px;font-size:30px;font-weight:bold;letter-spacing:6px;color:#3A3240;font-family:monospace;">${code}</p>
      <p style="margin:0;font-size:13px;color:#9B8FA0;font-family:Arial,sans-serif;">Value: <strong style="color:#3A3240;">$${amount.toFixed(2)} AUD</strong></p>
    </div>

    <div style="padding:0 40px 40px;">
      <p style="margin:0 0 24px;font-size:14px;color:#444;font-family:Arial,sans-serif;">
        Enter this code at checkout on your next Kentelle purchase to redeem your gift card.
      </p>
      <a href="https://kentelle.vercel.app/shop" style="display:inline-block;background:#D4A5B5;color:#3A3240;padding:14px 32px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;text-decoration:none;border-radius:2px;font-family:Arial,sans-serif;">Shop Now</a>
    </div>
  `);

  await getResend().emails.send({
    from: "onboarding@resend.dev",
    to: recipientEmail,
    subject: `You received a $${amount.toFixed(2)} Kentelle Gift Card!`,
    html,
  });
}

// ─── Order Confirmation Email ───────────────────────────────────────────────

interface OrderItem {
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  phone?: string;
}

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  items: OrderItem[],
  subtotal: number,
  shippingCost: number,
  total: number,
  shippingAddress?: ShippingAddress,
  discount?: number,
  couponCode?: string,
  billingAddress?: { fullName: string; line1: string; line2?: string; city: string; state: string; postcode: string }
) {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #E8D8E8;vertical-align:top;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" width="56" height="56" style="object-fit:cover;border-radius:2px;display:block;" />` : `<div style="width:56px;height:56px;background:#E8D8E8;border-radius:2px;"></div>`}
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #E8D8E8;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#3A3240;font-family:Arial,sans-serif;">${item.name}</p>
        <p style="margin:0;font-size:12px;color:#9B8FA0;font-family:Arial,sans-serif;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #E8D8E8;vertical-align:top;text-align:right;white-space:nowrap;">
        <p style="margin:0;font-size:14px;font-weight:bold;color:#3A3240;font-family:Arial,sans-serif;">$${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join("");

  const addressBlock = shippingAddress ? `
    <tr><td colspan="3" style="padding-top:8px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:16px;vertical-align:top;width:50%;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9B8FA0;font-family:Arial,sans-serif;">Shipping To</p>
            <p style="margin:0;font-size:14px;color:#3A3240;font-family:Arial,sans-serif;line-height:1.7;">
              <strong>${shippingAddress.fullName}</strong><br/>
              ${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br/>
              ${shippingAddress.city} ${shippingAddress.state} ${shippingAddress.postcode}<br/>
              Australia
              ${shippingAddress.phone ? `<br/><span style="color:#9B8FA0;">${shippingAddress.phone}</span>` : ""}
            </p>
          </td>
          ${billingAddress ? `<td style="vertical-align:top;width:50%;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9B8FA0;font-family:Arial,sans-serif;">Billing To</p>
            <p style="margin:0;font-size:14px;color:#3A3240;font-family:Arial,sans-serif;line-height:1.7;">
              <strong>${billingAddress.fullName}</strong><br/>
              ${billingAddress.line1}${billingAddress.line2 ? `, ${billingAddress.line2}` : ""}<br/>
              ${billingAddress.city} ${billingAddress.state} ${billingAddress.postcode}<br/>
              Australia
            </p>
          </td>` : ""}
        </tr>
      </table>
    </td></tr>
  ` : "";

  const html = emailWrapper(`
    <!-- Confirmation hero -->
    <div style="background:#F5EEF3;padding:32px 40px;text-align:center;border-bottom:2px solid #B5C9C5;">
      <div style="display:inline-block;width:48px;height:48px;background:#E8D8E8;border-radius:50%;line-height:48px;font-size:24px;margin-bottom:12px;">✓</div>
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B5C9C5;font-family:Arial,sans-serif;">Order Confirmed</p>
      <h2 style="margin:0 0 8px;font-size:22px;color:#3A3240;font-family:Arial,sans-serif;">Thank you for your order!</h2>
      <p style="margin:0;font-size:14px;color:#9B8FA0;font-family:Arial,sans-serif;">Order <strong style="color:#3A3240;">#${orderNumber}</strong> &mdash; ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>

    <!-- Items -->
    <div style="padding:32px 40px 0;">
      <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9B8FA0;font-family:Arial,sans-serif;">Items Ordered</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemRows}

        <!-- Totals -->
        <tr><td colspan="3" style="padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#9B8FA0;font-family:Arial,sans-serif;padding:4px 0;">Subtotal</td>
              <td style="font-size:13px;color:#3A3240;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">$${subtotal.toFixed(2)} AUD</td>
            </tr>
            ${discount && discount > 0 ? `<tr>
              <td style="font-size:13px;color:#22a26a;font-family:Arial,sans-serif;padding:4px 0;">Discount${couponCode ? ` (${couponCode})` : ""}</td>
              <td style="font-size:13px;color:#22a26a;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">−$${discount.toFixed(2)} AUD</td>
            </tr>` : ""}
            <tr>
              <td style="font-size:13px;color:#9B8FA0;font-family:Arial,sans-serif;padding:4px 0;">Shipping</td>
              <td style="font-size:13px;color:#3A3240;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">${shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)} AUD`}</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:bold;color:#3A3240;font-family:Arial,sans-serif;padding:12px 0 0;border-top:2px solid #E8D8E8;">Total Paid</td>
              <td style="font-size:16px;font-weight:bold;color:#3A3240;font-family:Arial,sans-serif;padding:12px 0 0;text-align:right;border-top:2px solid #E8D8E8;">$${total.toFixed(2)} AUD</td>
            </tr>
          </table>
        </td></tr>

        <!-- Shipping address -->
        ${addressBlock}
      </table>
    </div>

    <!-- What's next -->
    <div style="margin:32px 40px;background:#F5EEF3;border-left:3px solid #B5C9C5;padding:16px 20px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#3A3240;font-weight:bold;font-family:Arial,sans-serif;">What happens next?</p>
      <p style="margin:0;font-size:14px;color:#555;font-family:Arial,sans-serif;">We'll send you a shipping confirmation with your tracking number once your order is dispatched. Delivery typically takes 3–7 business days within Australia.</p>
    </div>

    <!-- CTA -->
    <div style="padding:0 40px 40px;text-align:center;">
      <a href="https://kentelle.vercel.app/shop" style="display:inline-block;background:#D4A5B5;color:#3A3240;padding:14px 32px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;text-decoration:none;border-radius:2px;font-family:Arial,sans-serif;margin-right:12px;">Continue Shopping</a>
      <a href="https://kentelle.vercel.app/account/orders" style="display:inline-block;background:transparent;color:#3A3240;padding:13px 32px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;text-decoration:none;border-radius:2px;border:2px solid #3A3240;font-family:Arial,sans-serif;">View My Orders</a>
    </div>
  `);

  await getResend().emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `Order Confirmed — #${orderNumber} | Kentelle Skincare`,
    html,
  });
}
