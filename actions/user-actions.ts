"use server"

import { redis } from "@/lib/redis"
import { isValidCPF } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

// New Redis keys for optimized storage
const USER_HASH_KEY = "users:all" // Stores all user data as hash fields
const USER_SORTED_SET_KEY = "users:timestamps" // Stores user IDs sorted by timestamp for pagination

export async function submitUserData(formData: FormData) {
  console.log("submitUserData: Iniciando submissão de dados do usuário.")
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const dob = formData.get("dob") as string
  const cpf = formData.get("cpf") as string
  const email = formData.get("email") as string

  // Basic validation
  if (!fullName || !phone || !dob || !cpf || !email) {
    console.error("submitUserData: Todos os campos são obrigatórios.")
    return { error: "Todos os campos são obrigatórios." }
  }

  // CPF validation
  if (!isValidCPF(cpf)) {
    console.error("submitUserData: CPF inválido.")
    return { error: "CPF inválido." }
  }

  const userData = {
    id: uuidv4(), // Generate a unique ID for each user
    fullName,
    phone,
    dob,
    cpf,
    email,
    timestamp: new Date().toISOString(),
  }

  try {
    // Store user data in a Redis Hash, keyed by user ID
    console.log(`submitUserData: Tentando hset para USER_HASH_KEY com ID ${userData.id}`)
    await redis.hset(USER_HASH_KEY, userData.id, JSON.stringify(userData))
    console.log("submitUserData: hset bem-sucedido.")

    // Add user ID to a Sorted Set, with timestamp as score for chronological sorting
    console.log(`submitUserData: Tentando zadd para USER_SORTED_SET_KEY com ID ${userData.id}`)
    await redis.zadd(USER_SORTED_SET_KEY, { score: Date.now(), member: userData.id })
    console.log("submitUserData: zadd bem-sucedido.")

    // Retrieve and return the laundry password
    console.log("submitUserData: Tentando obter senha da lavanderia.")
    const laundryPassword = (await redis.get("laundry:password")) || "123" // Default if not set
    console.log("submitUserData: Senha da lavanderia obtida.")

    return { success: true, laundryPassword }
  } catch (error) {
    console.error("submitUserData: Erro ao interagir com Redis:", error)
    return { error: "Erro ao salvar dados. Por favor, tente novamente." }
  }
}

export async function getPaginatedUserData(page: number, limit: number) {
  console.log(`getPaginatedUserData: Buscando dados para página ${page}, limite ${limit}.`)
  const start = (page - 1) * limit
  const end = start + limit - 1

  try {
    // Get user IDs from the sorted set, ordered by timestamp (most recent first)
    console.log(`getPaginatedUserData: Tentando zrevrange para USER_SORTED_SET_KEY de ${start} a ${end}.`)
    const userIds = await redis.zrevrange(USER_SORTED_SET_KEY, start, end)
    console.log(`getPaginatedUserData: IDs de usuário obtidos: ${userIds.length}`)

    if (userIds.length === 0) {
      console.log("getPaginatedUserData: Nenhum ID de usuário encontrado.")
      return []
    }

    // Fetch the actual user data from the hash using the retrieved IDs
    console.log(`getPaginatedUserData: Tentando hmget para USER_HASH_KEY com ${userIds.length} IDs.`)
    const rawUserData = await redis.hmget(USER_HASH_KEY, ...userIds)
    console.log("getPaginatedUserData: Dados brutos de usuário obtidos.")

    // Parse the JSON strings back into objects
    return rawUserData
      .map((item) => {
        if (item) {
          try {
            return JSON.parse(item as string)
          } catch (parseError) {
            console.error("getPaginatedUserData: Erro ao parsear JSON de dados do usuário:", parseError, "Dados:", item)
            return null // Return null for invalid JSON entries
          }
        }
        return null // Handle null items from hmget
      })
      .filter(Boolean) // Filter out any null entries
  } catch (error) {
    console.error("getPaginatedUserData: Erro ao interagir com Redis:", error)
    return []
  }
}

export async function getTotalUserDataCount() {
  console.log("getTotalUserDataCount: Buscando contagem total de usuários.")
  try {
    // Get the total count of members in the sorted set
    const count = await redis.zcard(USER_SORTED_SET_KEY)
    console.log(`getTotalUserDataCount: Contagem total de usuários: ${count}`)
    return count
  } catch (error) {
    console.error("getTotalUserDataCount: Erro ao obter contagem total de usuários do Redis:", error)
    return 0
  }
}
