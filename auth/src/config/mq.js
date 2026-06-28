import amqp from "amqplib";

let QUEUE = "auth_notification_queue";
let connection;
let channel;

export async function connectToQueue() {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, {
        durable: true,
    });

    console.log("RabbitMQ connected (AUTH)");
}

export async function sendAuthNotification(message) {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );
}