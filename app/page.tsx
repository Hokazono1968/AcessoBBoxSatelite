"use client"

import { useState, useEffect } from "react"
import MainForm from "@/components/main-form"
import PasswordDisplay from "@/components/password-display"
import AdminLogin from "@/components/admin-login"
import AdminDashboard from "@/components/admin-dashboard"
import { getLaundryPassword, getAdminPassword } from "@/lib/actions"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("main")
  const [laundryPassword, setLaundryPassword] = useState("123") // Default password
  const [adminPassword, setAdminPassword] = useState("Claudio") // Default admin password

  useEffect(() => {
    const loadPasswords = async () => {
      try {
        const storedLaundryPass = await getLaundryPassword()
        if (storedLaundryPass) {
          setLaundryPassword(storedLaundryPass)
        }
        const storedAdminPass = await getAdminPassword()
        if (storedAdminPass) {
          setAdminPassword(storedAdminPass)
        }
      } catch (error) {
        console.error("Erro ao carregar senhas iniciais:", error)
      }
    }
    loadPasswords()
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case "main":
        return <MainForm setCurrentPage={setCurrentPage} laundryPassword={laundryPassword} />
      case "password":
        return <PasswordDisplay setCurrentPage={setCurrentPage} laundryPassword={laundryPassword} />
      case "adminLogin":
        return <AdminLogin setCurrentPage={setCurrentPage} adminPassword={adminPassword} />
      case "adminDashboard":
        return (
          <AdminDashboard
            setCurrentPage={setCurrentPage}
            laundryPassword={laundryPassword}
            setLaundryPassword={setLaundryPassword}
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
          />
        )
      default:
        return <MainForm setCurrentPage={setCurrentPage} laundryPassword={laundryPassword} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {renderPage()}
      <Toaster />
    </div>
  )
}
