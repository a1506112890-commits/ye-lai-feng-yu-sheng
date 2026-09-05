const express = require("express");
const http = require("http");
const httpProxy = require("http-proxy");
const { spawn } = require("child_process");
const path = require("path");

const PUBLIC_DIR = "/app/public";
const GAME_SERVER = "/app/noname-server/game/server.js";
const PUBLIC_PORT = Number(process.env.PORT || 10000);
const GAME_PORT = 8080;

const app = express();
app.disable("x-powered-by");

// Simple health route for Render.
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    app: "qunyousha-render-real-noname",
    websocketBackend: `127.0.0.1:${GAME_PORT}`
  });
});

// Keep service workers and modules from being served with a stale HTML fallback.
app.use(express.static(PUBLIC_DIR, {
  index: "index.html",
  etag: true,
  maxAge: 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith("service-worker.js") || filePath.endsWith("serviceWorker.js")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    }
  }
}));

// Noname is a single-page-ish static application. Unknown navigation paths
// return index.html, while actual missing assets still normally resolve first.
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const server = http.createServer(app);

// Run the original noname WebSocket lobby server inside the same container.
const gameServer = spawn(process.execPath, [GAME_SERVER], {
  stdio: "inherit",
  env: { ...process.env }
});

gameServer.on("exit", (code, signal) => {
  console.error(`[noname-server] exited code=${code} signal=${signal}`);
  // Exit so Render restarts the instance instead of serving a dead lobby.
  process.exit(code || 1);
});

const wsProxy = httpProxy.createProxyServer({
  target: `ws://127.0.0.1:${GAME_PORT}`,
  ws: true,
  xfwd: true
});

wsProxy.on("error", (err, req, socket) => {
  console.error("[ws-proxy]", err && err.stack ? err.stack : err);
  try { socket.destroy(); } catch {}
});

// Every WebSocket upgrade on the public Render URL is forwarded to the
// original noname server on localhost:8080.
server.on("upgrade", (req, socket, head) => {
  wsProxy.ws(req, socket, head);
});

server.listen(PUBLIC_PORT, "0.0.0.0", () => {
  console.log(`[gateway] web + websocket gateway on 0.0.0.0:${PUBLIC_PORT}`);
  console.log(`[gateway] static client: ${PUBLIC_DIR}`);
  console.log(`[gateway] internal noname server: ws://127.0.0.1:${GAME_PORT}`);
});

function shutdown(signal) {
  console.log(`[gateway] ${signal}, shutting down`);
  try { gameServer.kill("SIGTERM"); } catch {}
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
