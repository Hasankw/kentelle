import { NextRequest, NextResponse } from "next/server";
import { generateOTP, createOTPToken } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  const code = generateOTP();
  const token = createOTPToken(email.toLowerCase().trim(), code);

  try {
    await sendOTPEmail(email.trim(), name.trim(), code);
  } catch {
    return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ token });
}
