"use strict";
// Post-build script: copies assets into standalone dir and wraps server.js
// with a port-guard so Hostinger's duplicate worker exits cleanly.
const { cpSync, writeFileSync, renameSync, existsSync, mkdtempSync, rmSync } = require("fs");
const { execSync } = require("child_process");
const os = require("os");
const path = require("path");

// Hostinger runs Linux x64, but this build may run on any dev machine (e.g. macOS).
// npm only installs sharp's native binary for the CURRENT platform, so force-install
// the linux-x64 one into an isolated scratch dir (never touch the project's own
// node_modules — that would strip the darwin binary local `next dev` needs) and copy
// it into the standalone bundle. Without this, sharp throws at import time on the
// server, which crashes every route that imports lib/imageOptimize.ts, including
// unrelated GET handlers in the same file.
const scratchDir = mkdtempSync(path.join(os.tmpdir(), "sharp-linux-x64-"));
writeFileSync(path.join(scratchDir, "package.json"), "{}");
execSync(
  "npm install --no-save --force --os=linux --cpu=x64 --libc=glibc sharp",
  { cwd: scratchDir, stdio: "inherit" }
);
cpSync(
  path.join(scratchDir, "node_modules/@img/sharp-linux-x64"),
  ".next/standalone/node_modules/@img/sharp-linux-x64",
  { recursive: true }
);
cpSync(
  path.join(scratchDir, "node_modules/@img/sharp-libvips-linux-x64"),
  ".next/standalone/node_modules/@img/sharp-libvips-linux-x64",
  { recursive: true }
);
rmSync(scratchDir, { recursive: true, force: true });

cpSync("public", ".next/standalone/public", { recursive: true });
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });

// Rename the Next.js generated server so we can wrap it.
renameSync(".next/standalone/server.js", ".next/standalone/standalone-server.js");

// Write a guard wrapper: if the port is already bound (second worker), exit 0.
writeFileSync(
  ".next/standalone/server.js",
  `"use strict";
const net = require("net");
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = "0.0.0.0";
const port = parseInt(process.env.PORT, 10);
const host = process.env.HOSTNAME;
const guard = net.createServer();
guard.once("error", function (err) {
  if (err.code === "EADDRINUSE") {
    // Another worker is already running — exit cleanly so PM2 doesn't restart.
    process.exit(0);
  }
  throw err;
});
guard.once("listening", function () {
  guard.close(function () {
    require("./standalone-server.js");
  });
});
guard.listen(port, host);
`
);

console.log("Post-build complete: standalone assets copied, server.js port-guarded.");
