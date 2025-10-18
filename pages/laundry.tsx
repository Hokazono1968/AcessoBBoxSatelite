// pages/laundry.tsx
import RequestCodeButton from "../components/RequestCodeButton";

export default function LaundryPage() {
  const user = {
    fullName: "Marcelo Eduardo Yukio Hokazono",
    email: "marcelo.hokazono@gmail.com",
    phone: "12981961801",
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Solicitar Código da Lavanderia</h1>
      <p className="mb-4 text-center">
        Para receber o código de abertura da porta da lavanderia, você precisará enviar
        um e-mail para o administrador. Seu e-mail será preenchido automaticamente.
      </p>
      <p className="mb-6 text-center font-semibold">
        Clique no botão abaixo e siga os passos para concluir o pedido.
      </p>
      <div className="flex justify-center">
        <RequestCodeButton
          fullName={user.fullName}
          email={user.email}
          phone={user.phone}
        />
      </div>
    </div>
  );
}
