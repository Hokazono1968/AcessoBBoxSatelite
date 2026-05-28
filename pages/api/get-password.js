import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {

  try {

    let password =
      await redis.get("laundry_password")

    if (!password) {

      password = "#182369*"

      await redis.set(
        "laundry_password",
        password
      )

    }

    return res.status(200).json({
      password
    })

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}