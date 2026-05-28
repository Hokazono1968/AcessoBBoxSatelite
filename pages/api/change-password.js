import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Método inválido"
    })

  }

  try {

    const {
      adminPassword,
      newPassword
    } = req.body

    if (
      adminPassword !==
      process.env.ADMIN_PASSWORD
    ) {

      return res.status(401).json({
        error: "Senha admin inválida"
      })

    }

    await redis.set(
      "laundry_password",
      newPassword
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