#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

// Catch unhandled errors so Hostinger logs show the real crash reason
process.on("uncaughtException", (err) => {
  console.error("[start] UNCAUGHT EXCEPTION:", err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[start] UNHANDLED REJECTION:", reason);
  process.exit(1);
});

// Log env var presence (never values) to help diagnose missing config
const REQUIRED_VARS = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

// Load .env.production.local before Next.js starts, so all server modules
// get the correct env vars even if Hostinger doesn't inject them at runtime.
const envFiles = [".env.production.local", ".env.local", ".env.production", ".env"];
for (const file of envFiles) {
  const fp = path.resolve(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  const lines = fs.readFileSync(fp, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
  console.log(`[start] Loaded ${file}`);
}

// Log which required vars are present/missing
for (const v of REQUIRED_VARS) {
  console.log(`[start] ${v}: ${process.env[v] ? "SET" : "MISSING"}`);
}

// Check .next build exists
const buildId = path.resolve(__dirname, ".next/BUILD_ID");
if (!fs.existsSync(buildId)) {
  console.error("[start] ERROR: .next/BUILD_ID not found — build may have failed or .next was not created");
  process.exit(1);
}
console.log(`[start] .next build found (BUILD_ID: ${fs.readFileSync(buildId, "utf8").trim()})`);

// Replace argv so the Next.js CLI sees "start" as the command
process.argv = ["node", path.resolve(__dirname, "node_modules/next/dist/bin/next"), "start"];
require("./node_modules/next/dist/bin/next");
