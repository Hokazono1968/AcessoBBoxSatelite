import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    })
  }

  try {

    const data = req.body

    const access = {
      ...data,
      createdAt: new Date().toISOString()
    }

    await redis.lpush(
      "access_logs",
      JSON.stringify(access)
    )

    return res.status(200).json({
      success: true
    })

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}