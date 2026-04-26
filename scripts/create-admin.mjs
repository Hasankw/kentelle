/**
 * Creates the admin account in Supabase via REST API.
 * Run: node scripts/create-admin.mjs
 *
 * Admin login: admin@kentelle.com / Kentelle@Admin2024
 */

import crypto from "crypto";

const SUPABASE_URL = "https://siwgptjhirmkabyjmddm.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2dwdGpoaXJta2FieWptZGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg3NTA4NiwiZXhwIjoyMDY3NDUxMDg2fQ.z13rLNF2aWzEKQ-GAhFqoGjBN37MFkXw3exJEbmfQKo";

// Simple bcrypt-like hash using PBKDF2 (native Node.js — no bcryptjs needed here)
// The actual app uses bcryptjs for comparison, so we need a real bcrypt hash.
// This script uses the 'bcryptjs' package.

let bcrypt;
try {
  bcrypt = await import("bcryptjs");
  bcrypt = bcrypt.default ?? bcrypt;
} catch {
  console.error("Install bcryptjs: npm install bcryptjs");
  process.exit(1);
}

const password = "Kentelle@Admin2024";
const hash = await bcrypt.hash(password, 12);

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=minimal",
};

const res = await fetch(`${SUPABASE_URL}/rest/v1/Admin`, {
  method: "POST",
  headers,
  body: JSON.stringify([
    {
      id: crypto.randomUUID().replace(/-/g, "").slice(0, 25),
      email: "admin@kentelle.com",
      passwordHash: hash,
      role: "superadmin",
    },
  ]),
});

if (res.ok || res.status === 409) {
  console.log("✓ Admin account ready");
  console.log("  Email:    admin@kentelle.com");
  console.log("  Password: Kentelle@Admin2024");
} else {
  const err = await res.text();
  console.error("Failed:", err);
}
