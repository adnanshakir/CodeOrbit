import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// middlewares
app.use(express.json());
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
  const host = req.headers.host || "";
  const parts = host.split(".");
  const sandboxId = parts[0];
  const subdomain = parts[1] || "";

  // Route preview hostnames (*.preview.localhost) to the sandbox service
  if (subdomain === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }

  // Route agent hostnames (*.agent.localhost) to the agent proxy
  if (subdomain === "agent") {
    return getAgentproxy(sandboxId)(req, res, next);
  }

  return next();
});

export default app;
