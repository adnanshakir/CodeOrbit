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

// proxy middleware
app.use((req, res, next) => {
  const host = req.headers.host;
  const sandboxId = host.split(".")[0];

  return getProxy(sandboxId)(req, res, next);
});

export default app;
 