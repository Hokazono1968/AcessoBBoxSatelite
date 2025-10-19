"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { updateLaundryPassword, updateAdminPassword, getAccessRecords } from "@/lib/actions"
import { SettingsIcon, LogOutIcon } from "lucide-react"

interface AccessRecord {
  fullName: string
  phone: string
  birthDate: string
  cpf: string
  email: string
  timestamp: string
  laundryPassword: string
}

export default function AdminDashboard({
  setCurrentPage,
  laundryPassword,
  setLaundryPassword,
  adminPassword,
  setAdminPassword,
}: {
  setCurrentPage: (page: string) => void
  laundryPassword: string
  setLaundryPassword: (password: string) => void
  adminPassword: string
  setAdminPassword: (password: string) => void
}) {
  const { toast } = useToast()
  const [newLaundryPass, setNewLaundryPass] = useState("")
  const [newAdminPass, setNewAdminPass] = useState("")
  const [confirmAdminPass, setConfirmAdminPass] = useState("")
  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)

  const loadRecords = async () => {
    setLoadingRecords(true)
    try {
      const records = await getAccessRecords()
      setAccessRecords(records || [])
    } catch (error) {
      console.error("Erro ao carregar registros de acesso:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar registros de acesso.",
        variant: "destructive",
      })
    } finally {
      setLoadingRecords(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const handleUpdateLaundryPassword = async () => {
    if (!newLaundryPass.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma nova senha para a lavanderia.",
        variant: "destructive",
      })
      return
    }
    try {
      await updateLaundryPassword(newLaundryPass)
      setLaundryPassword(newLaundryPass)
      setNewLaundryPass("")
      toast({
        title: "Sucesso",
        description: "Senha da lavanderia atualizada com sucesso!",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao atualizar senha da lavanderia:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a senha da lavanderia. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAdminPassword = async () => {
    if (!newAdminPass.trim() || !confirmAdminPass.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha ambos os campos de senha administrativa.",
        variant: "destructive",
      })
      return
    }
    if (newAdminPass !== confirmAdminPass) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem. Por favor, tente novamente.",
        variant: "destructive",
      })
      return
    }
    try {
      await updateAdminPassword(newAdminPass)
      setAdminPassword(newAdminPass)
      setNewAdminPass("")
      setConfirmAdminPass("")
      toast({
        title: "Sucesso",
        description: "Senha administrativa atualizada com sucesso!",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao atualizar senha administrativa:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a senha administrativa. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-4xl rounded-xl shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SettingsIcon className="h-10 w-10 text-indigo-600" />
            <CardTitle className="text-2xl font-bold text-indigo-800 ml-3">Painel Administrativo</CardTitle>
          </div>
          <Button variant="ghost" onClick={() => setCurrentPage("main")}>
            <LogOutIcon className="h-5 w-5 mr-2" /> Sair
          </Button>
        </div>
        <CardDescription>Gerencie as senhas e visualize os registros de acesso.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-50 border border-gray-200 p-4">
            <CardTitle className="text-lg font-medium text-gray-800 mb-3">
              Configuração de Senhas da Lavanderia
            </CardTitle>
            <div className="mb-4">
              <Label htmlFor="currentLaundryPassword">Senha Atual da Lavanderia</Label>
              <Input id="currentLaundryPassword" value={laundryPassword} readOnly className="bg-gray-100" />
            </div>
            <div className="mb-4">
              <Label htmlFor="newLaundryPassword">Nova Senha da Lavanderia</Label>
              <Input
                id="newLaundryPassword"
                value={newLaundryPass}
                onChange={(e) => setNewLaundryPass(e.target.value)}
              />
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateLaundryPassword}>
              Atualizar Senha da Lavanderia
            </Button>
          </Card>

          <Card className="bg-gray-50 border border-gray-200 p-4">
            <CardTitle className="text-lg font-medium text-gray-800 mb-3">Configuração Administrativa</CardTitle>
            <div className="mb-4">
              <Label htmlFor="currentAdminPassword">Senha Administrativa Atual</Label>
              <Input id="currentAdminPassword" type="password" value={adminPassword} readOnly className="bg-gray-100" />
            </div>
            <div className="mb-4">
              <Label htmlFor="newAdminPassword">Nova Senha Administrativa</Label>
              <Input
                id="newAdminPassword"
                type="password"
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="confirmAdminPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmAdminPassword"
                type="password"
                value={confirmAdminPass}
                onChange={(e) => setConfirmAdminPass(e.target.value)}
              />
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateAdminPassword}>
              Atualizar Senha Administrativa
            </Button>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Registros de Acesso</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRecords ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Carregando registros...
                  </TableCell>
                </TableRow>
              ) : accessRecords.length > 0 ? (
                accessRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(record.timestamp).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{record.fullName}</TableCell>
                    <TableCell>{record.phone}</TableCell>
                    <TableCell>{record.cpf}</TableCell>
                    <TableCell>{record.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
