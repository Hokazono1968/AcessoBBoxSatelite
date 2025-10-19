"use server"

import { redis } from "@/lib/redis"
import { createAdminSession, deleteAdminSession, getAdminSession } from "@/lib/session"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

const ADMIN_PASSWORD_KEY = "admin:password_hash"

export async function getAdminPasswordStatus() {
  console.log("getAdminPasswordStatus: Verificando status da senha do administrador.")
  try {
    const passwordHash = await redis.get(ADMIN_PASSWORD_KEY)
    console.log("getAdminPasswordStatus: Senha do administrador existe:", !!passwordHash)
    return !!passwordHash // Returns true if password exists, false otherwise
  } catch (error) {
    console.error("getAdminPasswordStatus: Erro ao obter status da senha do administrador do Redis:", error)
    return false
  }
}

export async function setInitialAdminPassword(formData: FormData) {
  console.log("setInitialAdminPassword: Definindo senha inicial do administrador.")
  const password = formData.get("password") as string
  if (!password || password.length < 6) {
    console.error("setInitialAdminPassword: Senha muito curta.")
    return { error: "A senha deve ter pelo menos 6 caracteres." }
  }

  try {
    console.log("setInitialAdminPassword: Hashing da nova senha...")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("setInitialAdminPassword: Senha hashed. Tentando setar senha hash no Redis.")
    await redis.set(ADMIN_PASSWORD_KEY, hashedPassword)
    console.log("setInitialAdminPassword: Senha hash setada com sucesso no Redis.")

    // Create a session for the newly set admin
    await createAdminSession("admin") // Using a generic 'admin' ID for simplicity
    console.log("setInitialAdminPassword: Sessão de administrador criada. Redirecionando...")
    redirect("/admin")
  } catch (error) {
    console.error("setInitialAdminPassword: Erro ao definir senha inicial do administrador:", error)
    return { error: "Erro ao definir senha. Por favor, tente novamente." }
  }
}

export async function verifyAdminPassword(formData: FormData) {
  console.log("verifyAdminPassword: Verificando senha do administrador.")
  const password = formData.get("password") as string

  try {
    const storedHash = (await redis.get(ADMIN_PASSWORD_KEY)) as string | null
    console.log("verifyAdminPassword: Hash armazenado obtido:", !!storedHash ? "Presente" : "Ausente")

    if (!storedHash) {
      console.error("verifyAdminPassword: Nenhuma senha de administrador definida no Redis.")
      return { error: "Nenhuma senha de administrador definida. Por favor, defina uma." }
    }

    console.log("verifyAdminPassword: Comparando senha fornecida com hash armazenado...")
    const isValid = await bcrypt.compare(password, storedHash)
    console.log("verifyAdminPassword: Senha comparada, é válida:", isValid)

    if (isValid) {
      await createAdminSession("admin")
      console.log("verifyAdminPassword: Sessão de administrador criada. Redirecionando...")
      redirect("/admin")
    } else {
      console.error("verifyAdminPassword: Senha incorreta.")
      return { error: "Senha incorreta." }
    }
  } catch (error) {
    console.error("verifyAdminPassword: Erro ao verificar senha do administrador:", error)
    return { error: "Erro ao verificar senha. Por favor, tente novamente." }
  }
}

export async function changeAdminPassword(formData: FormData) {
  console.log("changeAdminPassword: Alterando senha do administrador.")
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  try {
    const storedHash = (await redis.get(ADMIN_PASSWORD_KEY)) as string | null
    console.log("changeAdminPassword: Hash armazenado obtido:", !!storedHash ? "Presente" : "Ausente")

    if (!storedHash) {
      console.error("changeAdminPassword: Nenhuma senha de administrador definida no Redis.")
      return { error: "Nenhuma senha de administrador definida." }
    }

    console.log("changeAdminPassword: Comparando senha atual com hash armazenado...")
    const isValid = await bcrypt.compare(currentPassword, storedHash)
    console.log("changeAdminPassword: Senha atual comparada, é válida:", isValid)

    if (!isValid) {
      console.error("changeAdminPassword: Senha atual incorreta.")
      return { error: "Senha atual incorreta." }
    }

    if (!newPassword || newPassword.length < 6) {
      console.error("changeAdminPassword: Nova senha muito curta.")
      return { error: "A nova senha deve ter pelo menos 6 caracteres." }
    }

    console.log("changeAdminPassword: Hashing da nova senha...")
    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    console.log("changeAdminPassword: Nova senha hashed. Tentando setar nova senha hash no Redis.")
    await redis.set(ADMIN_PASSWORD_KEY, newHashedPassword)
    console.log("changeAdminPassword: Nova senha hash setada com sucesso no Redis.")

    return { success: "Senha do administrador alterada com sucesso!" }
  } catch (error) {
    console.error("changeAdminPassword: Erro ao alterar senha do administrador:", error)
    return { error: "Erro ao alterar senha. Por favor, tente novamente." }
  }
}

export async function adminLogout() {
  console.log("adminLogout: Realizando logout do administrador.")
  try {
    await deleteAdminSession()
    console.log("adminLogout: Sessão de administrador deletada. Redirecionando...")
    redirect("/admin")
  } catch (error) {
    console.error("adminLogout: Erro ao fazer logout do administrador:", error)
    // Even if logout fails, we might still want to redirect to prevent a stuck state
    redirect("/admin")
  }
}

export async function checkAdminAuth() {
  console.log("checkAdminAuth: Verificando autenticação do administrador.")
  const session = await getAdminSession()
  if (!session) {
    console.log("checkAdminAuth: Nenhuma sessão encontrada. Redirecionando para /admin.")
    redirect("/admin") // Redirect to login if no session
  }
  console.log("checkAdminAuth: Sessão de administrador encontrada.")
}
