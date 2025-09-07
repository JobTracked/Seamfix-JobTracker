import Redis from "ioredis";

const redis = new Redis(); 


export const getCache = async (key) => {
  const cache = await redis.get(key);
  return cache;
};


export const setCache = async (key, value, ttl = 60 * 60 * 1000) => {
  await redis.set(key, value, "EX", ttl); 
  return true;
};


export const deleteCache = async (key) => {
  const result = await redis.del(key); 
  return result > 0;
};
 
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
})


redis.on("ready", () => {
  console.log("⚡ Redis is ready to use");
});


redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

