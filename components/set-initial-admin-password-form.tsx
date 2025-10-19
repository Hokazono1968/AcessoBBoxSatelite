"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setInitialAdminPassword } from "@/actions/auth-actions"

export function SetInitialAdminPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    const result = await setInitialAdminPassword(formData)
    if (result?.error) {
      setError(result.error)
    }
    setIsSubmitting(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Primeiro Acesso Administrativo</CardTitle>
        <CardDescription>Defina a senha para a área administrativa.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Definindo..." : "Definir Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
