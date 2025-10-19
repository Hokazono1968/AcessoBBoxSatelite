"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLaundryPassword, setLaundryPassword } from "@/actions/laundry-actions"
import { changeAdminPassword, adminLogout } from "@/actions/auth-actions"
import { getPaginatedUserData, getTotalUserDataCount } from "@/actions/user-actions"

interface UserData {
  id: string
  fullName: string
  phone: string
  dob: string
  cpf: string
  email: string
  timestamp: string
}

export function AdminDashboard() {
  const [laundryPassword, setLaundryPasswordState] = useState("")
  const [newLaundryPassword, setNewLaundryPassword] = useState("")
  const [laundryMessage, setLaundryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [currentAdminPassword, setCurrentAdminPassword] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [adminMessage, setAdminMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [userData, setUserData] = useState<UserData[]>([])
  const [loadingUserData, setLoadingUserData] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // You can adjust this number
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    const fetchPasswordsAndData = async () => {
      setLoadingUserData(true)
      const currentLaundryPass = await getLaundryPassword()
      setLaundryPasswordState(currentLaundryPass)

      const totalCount = await getTotalUserDataCount()
      setTotalUsers(totalCount)

      const paginatedUserData = await getPaginatedUserData(currentPage, itemsPerPage)
      setUserData(paginatedUserData)
      setLoadingUserData(false)
    }
    fetchPasswordsAndData()
  }, [currentPage, itemsPerPage])

  const handleSetLaundryPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLaundryMessage(null)
    const formData = new FormData()
    formData.append("newLaundryPassword", newLaundryPassword)
    const result = await setLaundryPassword(formData)
    if (result?.success) {
      setLaundryPasswordState(newLaundryPassword)
      setNewLaundryPassword("")
      setLaundryMessage({ type: "success", text: result.success })
    } else if (result?.error) {
      setLaundryMessage({ type: "error", text: result.error })
    }
  }

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminMessage(null)
    const formData = new FormData()
    formData.append("currentPassword", currentAdminPassword)
    formData.append("newPassword", newAdminPassword)
    const result = await changeAdminPassword(formData)
    if (result?.success) {
      setCurrentAdminPassword("")
      setNewAdminPassword("")
      setAdminMessage({ type: "success", text: result.success })
    } else if (result?.error) {
      setAdminMessage({ type: "error", text: result.error })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Área Administrativa</h1>

      <Card>
        <CardHeader>
          <CardTitle>Senha de Acesso à Lavanderia</CardTitle>
          <CardDescription>Gerencie a senha que os usuários recebem.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Senha Atual:</Label>
            <Input value={laundryPassword} readOnly className="font-mono" />
          </div>
          <form onSubmit={handleSetLaundryPassword} className="space-y-2">
            <Label htmlFor="newLaundryPassword">Alterar Senha da Lavanderia</Label>
            <Input
              id="newLaundryPassword"
              type="text"
              value={newLaundryPassword}
              onChange={(e) => setNewLaundryPassword(e.target.value)}
              placeholder="Nova senha da lavanderia"
              required
            />
            <Button type="submit">Salvar Nova Senha</Button>
            {laundryMessage && (
              <p className={`text-sm ${laundryMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                {laundryMessage.text}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha do Administrador</CardTitle>
          <CardDescription>Altere a senha para acessar esta área.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleChangeAdminPassword} className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="currentAdminPassword">Senha Atual do Administrador</Label>
              <Input
                id="currentAdminPassword"
                type="password"
                value={currentAdminPassword}
                onChange={(e) => setCurrentAdminPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newAdminPassword">Nova Senha do Administrador</Label>
              <Input
                id="newAdminPassword"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit">Alterar Senha do Admin</Button>
            {adminMessage && (
              <p className={`text-sm ${adminMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                {adminMessage.text}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados dos Usuários</CardTitle>
          <CardDescription>Informações enviadas pelos usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUserData ? (
            <p>Carregando dados dos usuários...</p>
          ) : userData.length === 0 ? (
            <p>Nenhum dado de usuário encontrado ainda.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome Completo</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data Nasc.</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data/Hora Pedido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.dob}</TableCell>
                        <TableCell>{user.cpf}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.timestamp).toLocaleString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.ceil(totalUsers / itemsPerPage) }, (_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage * itemsPerPage >= totalUsers}
                  variant="outline"
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <form action={adminLogout}>
        <Button variant="destructive">Sair da Área Administrativa</Button>
      </form>
    </div>
  )
}
