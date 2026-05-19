import express from "express";
import morgan from "morgan";


const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/api/ai/healthz", (req, res) => {
  res.status(200).json({ message: "Hello from the AI Orchestration service!", status: "success" });
});


export default app;