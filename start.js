#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

// Load .env.production.local before Next.js starts
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

const port = process.env.PORT || "3000";
console.log(`[start] Starting on port ${port}`);

// Replace argv so Next.js CLI sees "start --port <port>"
process.argv = [
  "node",
  path.resolve(__dirname, "node_modules/next/dist/bin/next"),
  "start",
  "--port",
  port,
];
require("./node_modules/next/dist/bin/next");
