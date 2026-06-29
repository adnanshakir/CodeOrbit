import "dotenv/config";
import app, { startConsumer } from "./src/app.js";
import { connectToQueue } from "./src/mq.js";

const PORT = process.env.PORT || 4000;

await connectToQueue();
startConsumer();

app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`);
});