import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // Write data to Redis

const subscriber = new Redis(process.env.REDIS_URL); // Return data from Redis

export async function createSandboxKey(sandboxId) {
  await redis.set(`sandbox:${sandboxId}`, JSON.stringify({ status: "active", createdAt: new Date().toISOString() }), "EX", 120);
}

subscriber.config("SET", "notify-keyspace-events", "Ex");

subscriber.subscribe("__keyevent@0__:expired");

subscriber.on("message", async (channel, key) => {
  console.log(`Sandbox with ID ${key} has expired.`);

  const sandboxId = key.split(":")[1];
});

export default { redis, subscriber };
