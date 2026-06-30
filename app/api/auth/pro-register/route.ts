import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

const BUCKET = "pro-documents";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const qualificationType = formData.get("qualificationType") as string;
  const trainingAck = formData.get("trainingAck") === "true";
  const certificate = formData.get("certificate") as File | null;

  if (!name || !email || !password || !qualificationType || !certificate) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!trainingAck) {
    return NextResponse.json({ error: "Training acknowledgment is required." }, { status: 400 });
  }
  if (certificate.size > MAX_SIZE) {
    return NextResponse.json({ error: "Certificate file must be under 10MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(certificate.type)) {
    return NextResponse.json({ error: "Certificate must be a PDF, JPG, or PNG." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseServiceClient();

  // Create Supabase auth user
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Upload certificate to Supabase Storage
  let proDocUrl: string | null = null;
  try {
    const ext = certificate.name.split(".").pop() ?? "pdf";
    const filename = `${userData.user.id}-${Date.now()}.${ext}`;
    const arrayBuffer = await certificate.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: certificate.type, upsert: false });

    if (!uploadError) {
      proDocUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;
    }
  } catch {
    // Non-fatal — application still created, admin can request doc manually
  }

  // Create customer record with proStatus = "pending"
  try {
    await db.customer.upsert({
      where: { email },
      create: {
        name,
        email,
        supabaseUid: userData.user.id,
        proStatus: "pending",
        proDocUrl,
        proTrainingAck: trainingAck,
      },
      update: {
        supabaseUid: userData.user.id,
        proStatus: "pending",
        proDocUrl,
        proTrainingAck: trainingAck,
      },
    });
  } catch {
    // Non-fatal
  }

  // Email Ken about new pro application
  try {
    const { sendProApplicationAlert } = await import("@/lib/resend");
    await sendProApplicationAlert(name, email, qualificationType);
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ success: true });
}
