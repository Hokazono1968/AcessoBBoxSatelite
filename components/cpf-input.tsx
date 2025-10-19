"use client"

import { useState, type ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isValidCPF } from "@/lib/utils"

interface CpfInputProps {
  id: string
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

export function CpfInput({ id, name, value, onChange, required = false }: CpfInputProps) {
  const [isValid, setIsValid] = useState(true)
  const [isTouched, setIsTouched] = useState(false)

  const handleCpfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawCpf = e.target.value.replace(/\D/g, "") // Remove non-digits
    const formattedCpf = formatCPF(rawCpf)
    e.target.value = formattedCpf // Update the event target value for the parent form

    onChange(e) // Pass the event up to the parent form handler

    if (isTouched && rawCpf.length === 11) {
      setIsValid(isValidCPF(rawCpf))
    } else if (rawCpf.length < 11) {
      setIsValid(true) // Don't show error until full length or touched
    }
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    setIsTouched(true)
    const rawCpf = e.target.value.replace(/\D/g, "")
    if (rawCpf.length === 11) {
      setIsValid(isValidCPF(rawCpf))
    } else {
      setIsValid(true) // Don't show error if not full length
    }
  }

  const formatCPF = (value: string) => {
    value = value.replace(/\D/g, "") // Remove non-digits
    value = value.replace(/(\d{3})(\d)/, "$1.$2")
    value = value.replace(/(\d{3})(\d)/, "$1.$2")
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    return value
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>CPF</Label>
      <Input
        id={id}
        name={name}
        placeholder="000.000.000-00"
        value={value}
        onChange={handleCpfChange}
        onBlur={handleBlur}
        required={required}
        maxLength={14} // Max length for formatted CPF
        className={!isValid && isTouched ? "border-red-500" : ""}
      />
      {!isValid && isTouched && <p className="text-sm text-red-500">CPF inválido. Por favor, insira um CPF válido.</p>}
    </div>
  )
}
