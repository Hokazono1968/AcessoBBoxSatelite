"use server"

import { redis } from "@/lib/redis"

const LAUNDRY_PASSWORD_KEY = "laundry:password"
const INITIAL_LAUNDRY_PASSWORD = "123"

export async function getLaundryPassword() {
  console.log("getLaundryPassword: Buscando senha da lavanderia.")
  try {
    let password = (await redis.get(LAUNDRY_PASSWORD_KEY)) as string | null
    if (!password) {
      // Set initial password if not found
      console.log("getLaundryPassword: Senha da lavanderia não encontrada, definindo inicial.")
      await redis.set(LAUNDRY_PASSWORD_KEY, INITIAL_LAUNDRY_PASSWORD)
      password = INITIAL_LAUNDRY_PASSWORD
    }
    console.log("getLaundryPassword: Senha da lavanderia obtida.")
    return password
  } catch (error) {
    console.error("getLaundryPassword: Erro ao obter senha da lavanderia do Redis:", error)
    return INITIAL_LAUNDRY_PASSWORD // Return default in case of error
  }
}

export async function setLaundryPassword(formData: FormData) {
  console.log("setLaundryPassword: Alterando senha da lavanderia.")
  const newPassword = formData.get("newLaundryPassword") as string
  if (!newPassword || newPassword.length === 0) {
    console.error("setLaundryPassword: Nova senha da lavanderia vazia.")
    return { error: "A senha da lavanderia não pode ser vazia." }
  }
  try {
    await redis.set(LAUNDRY_PASSWORD_KEY, newPassword)
    console.log("setLaundryPassword: Senha da lavanderia alterada com sucesso.")
    return { success: "Senha da lavanderia alterada com sucesso!" }
  } catch (error) {
    console.error("setLaundryPassword: Erro ao alterar senha da lavanderia no Redis:", error)
    return { error: "Erro ao alterar senha. Por favor, tente novamente." }
  }
}
