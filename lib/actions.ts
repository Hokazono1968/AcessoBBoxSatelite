"use server"

import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface UserData {
  fullName: string
  phone: string
  birthDate: string
  cpf: string
  email: string
  timestamp: string
  laundryPassword: string
}

export async function getLaundryPassword(): Promise<string | null> {
  try {
    const password = await redis.get<string>("laundryPassword")
    console.log("DEBUG: getLaundryPassword - Senha da lavanderia obtida:", password)
    return password || null
  } catch (error) {
    console.error("ERRO: getLaundryPassword - Erro ao buscar senha da lavanderia no Redis:", error)
    return null
  }
}

export async function updateLaundryPassword(newPassword: string): Promise<void> {
  try {
    console.log("DEBUG: updateLaundryPassword - Tentando atualizar senha da lavanderia para:", newPassword)
    await redis.set("laundryPassword", newPassword)
    console.log("DEBUG: updateLaundryPassword - Senha da lavanderia atualizada com sucesso.")
  } catch (error) {
    console.error("ERRO: updateLaundryPassword - Erro ao atualizar senha da lavanderia no Redis:", error)
    throw new Error("Falha ao atualizar a senha da lavanderia.")
  }
}

export async function getAdminPassword(): Promise<string | null> {
  try {
    const password = await redis.get<string>("adminPassword")
    console.log("DEBUG: getAdminPassword - Senha administrativa obtida:", password)
    return password || null
  } catch (error) {
    console.error("ERRO: getAdminPassword - Erro ao buscar senha administrativa no Redis:", error)
    return null
  }
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  try {
    console.log("DEBUG: updateAdminPassword - Tentando atualizar senha administrativa para:", newPassword)
    await redis.set("adminPassword", newPassword)
    console.log("DEBUG: updateAdminPassword - Senha administrativa atualizada com sucesso.")
  } catch (error) {
    console.error("ERRO: updateAdminPassword - Erro ao atualizar senha administrativa no Redis:", error)
    throw new Error("Falha ao atualizar a senha administrativa.")
  }
}

export async function saveUserData(userData: UserData): Promise<void> {
  try {
    console.log("DEBUG: saveUserData - Dados do usuário recebidos (raw):", userData)

    const stringifiedUserData = JSON.stringify(userData)
    console.log("DEBUG: saveUserData - Dados do usuário a serem salvos (stringified):", stringifiedUserData)
    console.log("DEBUG: saveUserData - Tipo da stringifiedUserData:", typeof stringifiedUserData)

    await redis.set(`user:${userData.cpf}`, stringifiedUserData)

    console.log("DEBUG: saveUserData - Preparando para lpush 'accessRecords' com valor:", stringifiedUserData)
    console.log("DEBUG: saveUserData - Tipo do valor para lpush:", typeof stringifiedUserData)
    await redis.lpush("accessRecords", stringifiedUserData)

    console.log("DEBUG: saveUserData - Dados do usuário salvos com sucesso no Redis.")
  } catch (error) {
    console.error("ERRO: saveUserData - Erro ao salvar dados do usuário no Redis:", error)
    throw new Error("Falha ao salvar os dados do usuário.")
  }
}

export async function getAccessRecords(): Promise<UserData[] | null> {
  try {
    console.log("DEBUG: getAccessRecords - Função iniciada.")
    const records: (string | string[])[] = await redis.lrange("accessRecords", 0, -1)
    console.log("DEBUG: getAccessRecords - Registros brutos do Redis (após lrange):", records)
    console.log(`DEBUG: getAccessRecords - Número de registros brutos: ${records ? records.length : 0}`)

    if (records && records.length > 0) {
      const parsedRecords = records
        .map((record, index) => {
          console.log(`DEBUG: getAccessRecords - Processando registro ${index}:`)
          console.log(
            `DEBUG: getAccessRecords - Tipo do item bruto: ${typeof record}, É array: ${Array.isArray(record)}`,
          )

          if (typeof record === "object" && record !== null && !Array.isArray(record)) {
            // Se já é um objeto (e não um array), use-o diretamente
            console.log(`DEBUG: getAccessRecords - Registro ${index} já é um objeto.`)
            return record as UserData
          }

          let jsonString: string | undefined

          if (typeof record === "string") {
            jsonString = record
            console.log(`DEBUG: getAccessRecords - Registro ${index} é uma string direta.`)
          } else if (Array.isArray(record) && typeof record[0] === "string") {
            jsonString = record[0]
            console.warn(`AVISO: getAccessRecords - Registro ${index} é um array aninhado. Usando o primeiro elemento.`)
          } else {
            console.error(
              `ERRO: getAccessRecords - Registro ${index} não é uma string, um array de string, ou um objeto válido. Pulando. Tipo: ${typeof record}, Valor:`,
              record,
            )
            return null
          }

          if (jsonString === "[object Object]") {
            console.warn(
              `AVISO: getAccessRecords - Registro ${index} é a string literal '[object Object]'. Não é JSON válido. Pulando este registro.`,
            )
            return null
          }

          console.log(
            `DEBUG: getAccessRecords - Tentando parsear JSON para registro ${index}: "${jsonString.substring(0, 50)}..."`,
          )
          try {
            const parsed = JSON.parse(jsonString)
            console.log(`DEBUG: getAccessRecords - Registro ${index} parseado com sucesso.`)
            return parsed
          } catch (parseError) {
            console.error(
              `ERRO: getAccessRecords - Falha ao fazer parse do registro ${index} (JSON string: "${jsonString.substring(0, 50)}..."):`,
              parseError,
            )
            return null
          }
        })
        .filter(Boolean) as UserData[]

      console.log("DEBUG: getAccessRecords - Registros parseados e revertidos (antes de reverter):", parsedRecords)
      return parsedRecords.reverse()
    }
    console.log("DEBUG: getAccessRecords - Nenhum registro encontrado ou registros vazios.")
    return []
  } catch (error) {
    console.error("ERRO: getAccessRecords - Erro ao buscar registros de acesso no Redis (nível superior):", error)
    return null
  }
}
