import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RocketIcon } from "lucide-react"

export default function ModernCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Bem-vindo!</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Explore as novas funcionalidades da nossa plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <RocketIcon className="h-16 w-16 text-purple-600 mb-4 animate-bounce" />
          <p className="text-center text-gray-700 leading-relaxed">
            Estamos entusiasmados em apresentar uma experiência de usuário aprimorada, com um design mais intuitivo e
            recursos poderosos.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center p-6 pt-0">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Começar Agora
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
