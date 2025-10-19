import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to validate CPF
export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, "") // Remove non-numeric characters
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false // Check length and if all digits are the same

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum = sum + Number.parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== Number.parseInt(cpf.substring(9, 10))) {
    return false
  }

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum = sum + Number.parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== Number.parseInt(cpf.substring(10, 11))) {
    return false
  }

  return true
}
