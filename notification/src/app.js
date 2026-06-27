import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";


dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Notification service is running");
});

export default app;