"use client"

import type React from "react"

import { useState, type ChangeEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CpfInput } from "@/components/cpf-input"
import { submitUserData } from "@/actions/user-actions"
import { isValidCPF } from "@/lib/utils"
import { LaundryPasswordDialog } from "@/components/laundry-password-dialog" // Import the new component

export default function HomePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dob: "",
    cpf: "",
    email: "",
  })
  const [laundryPassword, setLaundryPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false) // State for dialog visibility

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setLaundryPassword(null)
    setIsPasswordDialogOpen(false) // Close dialog before new submission

    // Client-side validation before sending to server
    if (!formData.fullName || !formData.phone || !formData.dob || !formData.cpf || !formData.email) {
      setError("Por favor, preencha todos os campos.")
      setIsSubmitting(false)
      return
    }

    if (!isValidCPF(formData.cpf)) {
      setError("CPF inválido. Por favor, insira um CPF válido.")
      setIsSubmitting(false)
      return
    }

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value)
    })

    const result = await submitUserData(form)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setLaundryPassword(result.laundryPassword)
      setIsPasswordDialogOpen(true) // Open dialog on success
      // Optionally clear form data after success
      setFormData({
        fullName: "",
        phone: "",
        dob: "",
        cpf: "",
        email: "",
      })
    }
    setIsSubmitting(false)
  }

  const handleClosePasswordDialog = () => {
    setIsPasswordDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-lg rounded-xl shadow-lg border-none bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
            Acesso à Lavanderia
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Preencha seus dados para obter a senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone com DDD</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(XX) XXXXX-XXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                type="tel"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Data de Nascimento</Label>
              <Input
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                type="date"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            <CpfInput
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                placeholder="seu.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                type="email"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full py-2 text-lg" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Obter Senha da Lavanderia"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Link href="/admin">
            <Button
              variant="outline"
              className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
            >
              Área Administrativa
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* New Dialog for displaying laundry password */}
      <LaundryPasswordDialog
        password={laundryPassword}
        isOpen={isPasswordDialogOpen}
        onClose={handleClosePasswordDialog}
      />
    </div>
  )
}
