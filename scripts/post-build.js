"use strict";
// Post-build script: copies assets into standalone dir and wraps server.js
// with a port-guard so Hostinger's duplicate worker exits cleanly.
const { cpSync, writeFileSync, renameSync, existsSync } = require("fs");

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
