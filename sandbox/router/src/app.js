import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { proxyUpgrade } from "httpxy";
import http from "http";

const app = express();

// middlewares
app.use(morgan("combined"));

// routes
app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getRequestRoute(req) {
  const host = req.headers.host || "";
  const [sandboxIdFromHost, typeFromHost] = host.split(".");

  if (typeFromHost === "agent" || typeFromHost === "preview") {
    return { sandboxId: sandboxIdFromHost, type: typeFromHost };
  }

  const url = new URL(req.url || "/", `http://${host || "localhost"}`);
  const sandboxIdFromQuery = url.searchParams.get("sandboxId");

  if (url.pathname.startsWith("/socket.io") && sandboxIdFromQuery) {
    return { sandboxId: sandboxIdFromQuery, type: "agent" };
  }

  return { sandboxId: null, type: null };
}

export function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;

  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    });
  }

  return proxies[sandboxId];
}

export function getAgentproxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}:3000`;

  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    });
  }

  return agentProxies[sandboxId];
}

// proxy middleware
app.use((req, res, next) => {
  const { sandboxId, type } = getRequestRoute(req);

  if (type === "agent") {
    return getAgentproxy(sandboxId)(req, res, next);
  }

  if (type === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }

  return res.status(404).json({
    error: "Invalid route",
    message: "Use {sandboxId}.agent.localhost or /socket.io?sandboxId={sandboxId} for Socket.IO.",
  });
});

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Handle WebSocket / Socket.IO upgrades
server.on("upgrade", (req, socket, head) => {
  const { sandboxId, type } = getRequestRoute(req);
  console.log("UPGRADE", req.headers.host, req.url);

  if (type === "agent") {
    proxyUpgrade({ host: `sandbox-service-${sandboxId}`, port: 3000 }, req, socket, head, {
      changeOrigin: true,
    }).catch((error) => {
      console.error("Agent WebSocket proxy error:", error.message);
      socket.destroy();
    });
    return;
  }

  if (type === "preview") {
    proxyUpgrade({ host: `sandbox-service-${sandboxId}`, port: 80 }, req, socket, head, {
      changeOrigin: true,
    }).catch((error) => {
      console.error("Preview WebSocket proxy error:", error.message);
      socket.destroy();
    });
    return;
  }

  socket.destroy();
});

export default server;
