import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { connectToQueue } from "./src/config/mq.js";

const PORT = process.env.PORT || 3000;

connectDB();
connectToQueue(); // Establish the connection to RabbitMQ before starting the server

app.listen(PORT, () => {
  console.log(`AuthServer is running on port ${PORT}`);
});
