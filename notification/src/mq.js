import amqp from "amqplib";

const QUEUE = "auth_notification_queue";

let connection;
let channel;

export async function connectToQueue() {
  connection = await amqp.connect(process.env.RABBITMQ_URL);

  channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, {
    durable: true,
  });

  console.log("RabbitMQ connected (NOTIFICATION)");
}

export function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }

  return channel;
}