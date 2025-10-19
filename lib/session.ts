import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

// This secret is used to encrypt and decrypt the session cookie.
// It should be a strong, random string and stored as an environment variable.
const secretKey = process.env.AUTH_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

if (!secretKey) {
  console.error("AUTH_SECRET environment variable is not set!")
}

export async function encrypt(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h") // Session expires in 1 hour
      .sign(encodedKey)
    console.log("Session encrypted successfully.")
    return token
  } catch (error) {
    console.error("Encryption failed:", error)
    throw error // Re-throw to propagate the error
  }
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) {
      console.log("No session provided for decryption.")
      return null
    }
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    console.log("Session decrypted successfully. Payload:", payload)
    return payload
  } catch (error) {
    console.error("Failed to decrypt session:", error)
    return null
  }
}

export async function createAdminSession(userId: string) {
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiration
  const session = await encrypt({ userId, expires })

  cookies().set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  })
}

export async function getAdminSession() {
  const session = cookies().get("admin_session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function deleteAdminSession() {
  cookies().delete("admin_session")
}
