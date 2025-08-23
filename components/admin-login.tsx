"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { SettingsIcon } from "lucide-react"

const formSchema = z.object({
  adminPassword: z.string().min(1, "Por favor, insira a senha administrativa."),
})

export default function AdminLogin({
  setCurrentPage,
  adminPassword,
}: { setCurrentPage: (page: string) => void; adminPassword: string }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.adminPassword === adminPassword) {
      setCurrentPage("adminDashboard")
    } else {
      toast({
        title: "Erro de Login",
        description: "Senha administrativa incorreta.",
        variant: "destructive",
      })
      form.setError("adminPassword", { message: "Senha incorreta." })
    }
  }

  return (
    <Card className="w-full max-w-md rounded-xl shadow-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <SettingsIcon className="h-12 w-12 text-indigo-600" />
          <CardTitle className="text-2xl font-bold text-indigo-800 ml-3">Área Administrativa</CardTitle>
        </div>
        <CardDescription>Insira a senha para acessar o painel de controle.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Administrativa</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              Acessar
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button variant="link" onClick={() => setCurrentPage("main")}>
          Voltar ao formulário principal
        </Button>
      </CardFooter>
    </Card>
  )
}
