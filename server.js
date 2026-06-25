#!/usr/bin/env node
"use strict";

// Standalone Next.js server — entry point for Hostinger Node.js hosting.
// Built by `next build` with `output: "standalone"` in next.config.ts.
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = "0.0.0.0";

require("./.next/standalone/server.js");
