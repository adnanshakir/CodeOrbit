import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
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

function getProxy(sandboxId) {
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

function getAgentproxy(sandboxId) {
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
  const host = req.headers.host;
  const sandboxId = host.split(".")[0];
  const type = host.split(".")[1];

  if (type === "agent") {
    return getAgentproxy(sandboxId)(req, res, next);
  }

  if (type === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }

  return res.status(404).json({ error: "Invalid subdomain" });
});

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Handle WebSocket / Socket.IO upgrades
server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host;

  if (!host) {
    socket.destroy();
    return;
  }

  const sandboxId = host.split(".")[0];
  const type = host.split(".")[1];

  if (type === "agent") {
    return getAgentproxy(sandboxId).upgrade(req, socket, head);
  }

  if (type === "preview") {
    return getProxy(sandboxId).upgrade(req, socket, head);
  }

  socket.destroy();
});

export default server;