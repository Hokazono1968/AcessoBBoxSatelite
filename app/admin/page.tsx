import { getAdminPasswordStatus } from "@/actions/auth-actions"
import { AdminLoginForm } from "@/components/admin-login-form"
import { SetInitialAdminPasswordForm } from "@/components/set-initial-admin-password-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getAdminSession } from "@/lib/session"

export default async function AdminPage() {
  const isAdminPasswordSet = await getAdminPasswordStatus()
  const session = await getAdminSession()

  if (!session) {
    // If no session, check if password is set to show login or initial setup
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
        {isAdminPasswordSet ? <AdminLoginForm /> : <SetInitialAdminPasswordForm />}
      </div>
    )
  }

  // If session exists, render the dashboard
  return <AdminDashboard />
}
