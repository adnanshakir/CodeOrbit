import express from "express";
import morgan from "morgan";
import fs from "fs";

const WORKING_DIR = "/workspace";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the agent!", status: "success" });
});

app.get("/list-files", async (req, res) => {
  try {
    const elements = await fs.promises.readdir(WORKING_DIR);
    res.status(200).json({ message: "Files in working directory", elements });
  } catch (error) {
    console.error("Error reading directory:", error);
    res.status(500).json({ error: "Failed to read directory" });
  }
});

export default app;
