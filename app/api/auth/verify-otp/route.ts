import { NextRequest, NextResponse } from "next/server";
import { verifyOTPToken } from "@/lib/otp";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, code, name, password } = await req.json();

  if (!token || !code || !name || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = verifyOTPToken(token, code);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const email = result.email!;
  const supabaseAdmin = createSupabaseServiceClient();

  // Create Supabase user with email already confirmed (we verified it ourselves)
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (createError) {
    // User might already exist
    if (createError.message.toLowerCase().includes("already")) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Register in customer table
  try {
    await db.customer.upsert({
      where: { email },
      create: { name, email, supabaseUid: userData.user.id },
      update: { supabaseUid: userData.user.id },
    });
  } catch { /* non-fatal */ }

  // Send admin notification
  try {
    const { sendAdminNewUserAlert } = await import("@/lib/resend");
    await sendAdminNewUserAlert(name, email);
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true, email });
}
