import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { sendEmail } from "./email.js";
import { getEmailTemplate } from "./email.js";
import channel from "./mq.js";


dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Notification service is running");
});

app.get("/_status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/_status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

channel.consume("auth_notification_queue", async (msg) => {
  if (!msg) return;

  try {
    const { email, timestamp, userId, action } = JSON.parse(
      msg.content.toString()
    );

    const { subject, text, html } = getEmailTemplate(action, {
      userId,
      timestamp,
    });

    await sendEmail(email, subject, text, html);

    console.log(`${action} email sent to ${email}`);

    channel.ack(msg);
  } catch (error) {
    console.error("Error processing notification:", error);
    channel.nack(msg, false, false);
  }
});

export default app;
