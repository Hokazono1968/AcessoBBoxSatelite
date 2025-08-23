"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { KeyRoundIcon } from "lucide-react"

export default function PasswordDisplay({
  setCurrentPage,
  laundryPassword,
}: { setCurrentPage: (page: string) => void; laundryPassword: string }) {
  const { toast } = useToast()

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(laundryPassword).then(() => {
      toast({
        title: "Senha copiada!",
        description: "A senha foi copiada para a área de transferência.",
        variant: "default",
      })
    })
  }

  return (
    <Card className="w-full max-w-md rounded-xl shadow-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <KeyRoundIcon className="h-12 w-12 text-green-600" />
          <CardTitle className="text-2xl font-bold text-green-800 ml-3">Senha Gerada</CardTitle>
        </div>
        <CardDescription>Sua senha para acesso à lavanderia é:</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full mb-6">
          <div className="flex justify-between items-center mb-3">
            <span id="laundryPassword" className="text-4xl font-bold text-green-800">
              {laundryPassword}
            </span>
            <Button variant="ghost" size="icon" onClick={handleCopyPassword}>
              <CopyIcon className="h-5 w-5 text-green-600 hover:text-green-800" />
              <span className="sr-only">Copiar Senha</span>
            </Button>
          </div>
          <p className="text-sm text-green-700">
            <strong>Orientação:</strong> Digite a senha pausadamente no controlador de acesso ao lado da porta e após o sinal sonoro
            abrir a porta.
          </p>
        </div>
        <p className="text-sm text-gray-600 text-center">
          Guarde esta senha com segurança. Ela será necessária para acessar a lavanderia.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setCurrentPage("main")}>
          Voltar ao Início
        </Button>
      </CardFooter>
    </Card>
  )
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}
