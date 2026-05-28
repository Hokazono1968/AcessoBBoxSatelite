import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {

  try {

    const logs =
      await redis.lrange(
        "access_logs",
        0,
        100
      )

    const parsed =
      logs.map(item =>
        JSON.parse(item)
      )

    return res.status(200).json(parsed)

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}