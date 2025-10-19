// components/RequestCodeButton.tsx
import React, { useState } from "react";
import { Mail } from "lucide-react"; // ícone de e-mail

interface RequestCodeButtonProps {
  fullName: string;
  email: string;
  cpf: string; // substitui o campo telefone
}

// Variável de ambiente para e-mail do administrador
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@acesso24h.com";
// Prefixo do assunto usado para identificar o pedido
const SUBJECT_PREFIX = "REQ-CODE";

const RequestCodeButton: React.FC<RequestCodeButtonProps> = ({ fullName, email, cpf }) => {
  const [showModal, setShowModal] = useState(false);

  // Gera o link mailto com todos os parâmetros
  const makeMailto = () => {
    const cpfDigits = (cpf || "").replace(/\D/g, "");
    const subject = `${SUBJECT_PREFIX}:${cpfDigits}`;
    const body = [
      `Olá,`,
      ``,
      `Solicito o código de acesso para a porta (lavanderia).`,
      ``,
      `Nome: ${fullName || ""}`,
      `CPF: ${cpfDigits}`,
      `E-mail: ${email}`,
      ``,
      `Obrigado.`,
    ].join("\n");

    const mailto = `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return mailto;
  };

  const handleClick = () => {
    const mailto = makeMailto();
    window.location.href = mailto;
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Mail size={18} />
        Obter Código
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Quase lá!</h2>
            <p className="mb-4 text-center">
              Seu cliente de e-mail foi aberto com a mensagem pronta para o administrador.
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-6 text-left">
              <li>
                Verifique que o destinatário é <strong>{adminEmail}</strong>.
              </li>
              <li>
                Confirme que a mensagem inclui seu nome, e-mail e CPF corretamente.
              </li>
              <li className="font-semibold text-green-700">
                Clique em <strong>ENVIAR</strong> no seu e-mail para que o administrador possa responder com o código.
              </li>
            </ol>
            <p className="mb-4 text-center text-gray-700">
              Após enviar, aguarde o e-mail do administrador com o código de abertura da lavanderia.
            </p>
            <div className="flex justify-center">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCodeButton;
