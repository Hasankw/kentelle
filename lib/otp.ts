import { createHmac, randomInt, createHash } from "crypto";

const SECRET = process.env.OTP_SECRET ?? "kentelle-otp-fallback-secret";
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function generateOTP(): string {
  return String(randomInt(100000, 999999));
}

export function createOTPToken(email: string, code: string): string {
  const expires = Date.now() + EXPIRY_MS;
  const codeHash = createHash("sha256").update(code).digest("hex");
  const payload = Buffer.from(JSON.stringify({ email, codeHash, expires })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOTPToken(
  token: string,
  code: string
): { valid: boolean; email?: string; error?: string } {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return { valid: false, error: "Invalid token" };

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expectedSig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  if (sig !== expectedSig) return { valid: false, error: "Invalid token" };

  let parsed: { email: string; codeHash: string; expires: number };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return { valid: false, error: "Invalid token" };
  }

  if (Date.now() > parsed.expires) return { valid: false, error: "Code expired. Please request a new one." };

  const codeHash = createHash("sha256").update(code.trim()).digest("hex");
  if (codeHash !== parsed.codeHash) return { valid: false, error: "Incorrect code. Please try again." };

  return { valid: true, email: parsed.email };
}
