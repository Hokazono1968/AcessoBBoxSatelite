import { Redis } from "@upstash/redis"

// Initialize the Upstash Redis client using environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Add a log to confirm Redis client initialization
console.log(
  "Redis client initialized. URL present:",
  !!process.env.UPSTASH_REDIS_REST_URL,
  "Token present:",
  !!process.env.UPSTASH_REDIS_REST_TOKEN,
)
