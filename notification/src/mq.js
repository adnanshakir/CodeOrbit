import amqp from "amqplib";

let QUEUE = "auth_notification_queue";

let connection = await amqp.connect(process.env.RABBITMQ_URL);

let channel = await connection.createChannel();

channel.assertQueue(QUEUE, {
  durable: true,
});

export default channel;