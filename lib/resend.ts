import { Resend } from "resend";

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
    from: "orders@kentelle.com",
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
