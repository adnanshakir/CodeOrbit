import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import sandboxRouter from "./routes/sandbox.routes.js";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/sandbox/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Sandbox server is healthy!" });
});

app.use("/api/sandbox", sandboxRouter);

export default app;
