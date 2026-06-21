import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createProxyServer } from "httpxy";
import http from "http";

const app = express();

const wsProxy = createProxyServer({
  changeOrigin: true,
});

wsProxy.on("error", (err, req, socket) => {
  console.error("WS proxy error:", err.message);
  socket?.destroy();
});

// middlewares
app.use(morgan("combined"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// routes
app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getHostParts(req) {
  const hostname = req.headers.host?.split(":")[0];

  if (!hostname) {
    return { hostname: null, sandboxId: null, type: null };
  }

  const sandboxId = hostname.split(".")[0];
  const type = hostname.split(".")[1];

  return { hostname, sandboxId, type };
}

export function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;

  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
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
    });
  }

  return agentProxies[sandboxId];
}

// proxy middleware
app.use((req, res, next) => {
  console.log("HOST:", req.headers.host);
  console.log("URL:", req.url);
  next();
});

app.use((req, res, next) => {
  const { hostname } = getHostParts(req);

  if (!hostname) {
    return res.status(400).json({ error: "Missing host" });
  }

  const sandboxId = hostname.split(".")[0];
  const type = hostname.split(".")[1];

  if (type === "agent") {
    return getAgentproxy(sandboxId)(req, res, next);
  }

  if (type === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }

  return res.status(404).json({
    error: "Invalid route",
  });
});

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Handle WebSocket / Socket.IO upgrades
server.on("upgrade", (req, socket, head) => {
  const { hostname, sandboxId, type } = getHostParts(req);

  if (!hostname) {
    socket.destroy();
    return;
  }

  socket.on("error", () => socket.destroy());

  console.log("UPGRADE:", {
    host: req.headers.host,
    url: req.url,
    sandboxId,
    type,
  });

  if (type === "agent") {
    wsProxy.ws(
      req,
      socket,
      {
        target: `http://sandbox-service-${sandboxId}:3000`,
      },
      head
    ).catch(() => socket.destroy());

    return;
  }

  if (type === "preview") {
    wsProxy.ws(
      req,
      socket,
      {
        target: `http://sandbox-service-${sandboxId}`,
      },
      head
    ).catch(() => socket.destroy());

    return;
  }

  socket.destroy();
});

export default server;
