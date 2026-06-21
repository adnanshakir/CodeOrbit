import express from "express";
import morgan from "morgan";
import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
import { v7 as uuid } from "uuid";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/sandbox/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Sandbox server is healthy!" });
});

app.post("/api/sandbox/start", async (req, res) => {
  try {
    const sandboxId = uuid();
    await Promise.all([createPod(sandboxId), createService(sandboxId)]);

    return res.status(201).json({
      message: "Sandbox environment created successfully",
      sandboxId,
      previewUrl: `http://${sandboxId}.preview.localhost`,
      agentUrl: `http://${sandboxId}.agent.localhost`,
      agentSocketUrl: `http://${sandboxId}.agent.localhost`
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create sandbox environment",
      error: error.message,
    });
  }
});

export default app;
