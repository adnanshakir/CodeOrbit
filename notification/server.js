import "dotenv/config";
import app from "./src/app.js";
import { connectToQueue } from "./src/mq.js";

const PORT = process.env.PORT || 4000;

connectToQueue();

app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`);
});