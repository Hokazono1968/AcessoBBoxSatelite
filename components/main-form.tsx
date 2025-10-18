"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { saveUserData } from "@/lib/actions"
import { LaundryIcon } from "./icons" // Using a custom icon for the laundry machine

const formSchema = z.object({
  fullName: z.string().min(1, "Por favor, insira seu nome completo."),
  // Regex to accept exactly 10 or 11 digits (DDD + 8/9 digits), only numbers.
  phone: z.string().regex(/^\d{10,11}$/, "Por favor, insira um telefone válido com 10 ou 11 dígitos (apenas números)."),
  birthDate: z.string().min(1, "Por favor, insira sua data de nascimento."),
  // CPF should be exactly 11 digits, only numbers.
  cpf: z.string().regex(/^\d{11}$/, "Por favor, insira um CPF válido (apenas 11 dígitos numéricos)."),
  email: z.string().email("Por favor, insira um e-mail válido."),
})

export default function MainForm({
  setCurrentPage,
  laundryPassword,
}: { setCurrentPage: (page: string) => void; laundryPassword: string }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      birthDate: "",
      cpf: "",
      email: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Ensure phone and cpf are stored as pure numbers by removing any non-digits
      const cleanedValues = {
        ...values,
        phone: values.phone.replace(/\D/g, ""),
        cpf: values.cpf.replace(/\D/g, ""),
        laundryPassword,
        timestamp: new Date().toISOString(), // Adiciona o timestamp atual
      }
      await saveUserData(cleanedValues)
      toast({
        title: "Sucesso!",
        description: "Seus dados foram salvos e a senha foi gerada.",
        variant: "default",
      })
      
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Function to format phone number for display with a mask
  const formatPhoneNumberForDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, "") // Remove all non-digits
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`
    } else if (cleaned.length <= 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`
    } else if (cleaned.length <= 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`
    }
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}` // Max 11 digits
  }

  // Function to format CPF for display with a mask
  const formatCpfForDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, "") // Remove all non-digits
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3)}`
    } else if (cleaned.length <= 9) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6)}`
    } else if (cleaned.length <= 11) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`
    }
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}` // Max 11 digits
  }

  return (
    <Card className="w-full max-w-md rounded-xl shadow-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <LaundryIcon className="h-12 w-12 text-indigo-600" />
          <CardTitle className="text-2xl font-bold text-indigo-800 ml-3">Sistema de Acesso BBox Satelite</CardTitle>
        </div>
        <CardDescription>Preencha seus dados para receber a senha da lavanderia.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone com DDD</FormLabel>
                  <FormControl>
                    <Input
                      type="tel" // Added type="tel" for better mobile keyboard
                      value={formatPhoneNumberForDisplay(field.value)} // Display formatted value
                      onChange={(e) => {
                        const cleanedValue = e.target.value.replace(/\D/g, "") // Clean for internal state
                        field.onChange(cleanedValue) // Update form state with cleaned value
                      }}
                      placeholder="Ex: (11) 98765-4321"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      value={formatCpfForDisplay(field.value)} // Display formatted value
                      onChange={(e) => {
                        const cleanedValue = e.target.value.replace(/\D/g, "") // Clean for internal state
                        field.onChange(cleanedValue) // Update form state with cleaned value
                      }}
                      placeholder="Ex: 123.456.789-01"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              {form.formState.isSubmitting ? <div className="loading-spinner mx-auto" /> : "Obter Senha"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button variant="link" onClick={() => setCurrentPage("adminLogin")}>
          Acessar Área Administrativa
        </Button>
      </CardFooter>
    </Card>
  )
}
