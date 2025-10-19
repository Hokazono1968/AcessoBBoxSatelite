// pages/api/check-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Imap from "imap";
import { simpleParser } from "mailparser";
import { Redis } from "@upstash/redis";
import fetch from "node-fetch";

// Conexão com o Redis (Upstash)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Função auxiliar para limpar caracteres não numéricos
function normalizeDigits(s?: string) {
  return (s || "").replace(/\D/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const runNow = req.query.run === "true" || req.method === "POST";

  if (!runNow) {
    return res.status(400).json({ ok: false, error: "Chame esse endpoint com POST ou ?run=true" });
  }

  const IMAP_USER = process.env.IMAP_USER;
  const IMAP_PASS = process.env.IMAP_PASS;
  const IMAP_HOST = process.env.IMAP_HOST || "imap.gmail.com";
  const IMAP_PORT = Number(process.env.IMAP_PORT || 993);
  const IMAP_TLS = process.env.IMAP_TLS !== "false";

  if (!IMAP_USER || !IMAP_PASS || !IMAP_HOST) {
    return res.status(500).json({ ok: false, error: "Configuração IMAP incompleta nas variáveis de ambiente" });
  }

  const imap = new Imap({
    user: IMAP_USER,
    password: IMAP_PASS,
    host: IMAP_HOST,
    port: IMAP_PORT,
    tls: IMAP_TLS,
  });

  const openInbox = (cb: (err: any, box?: any) => void) => imap.openBox("INBOX", false, cb);

  try {
    imap.once("ready", () => {
      openInbox((err) => {
        if (err) {
          console.error("Erro abrir INBOX:", err);
          imap.end();
          return res.status(500).json({ ok: false, error: String(err) });
        }

        imap.search(["UNSEEN"], (err2, results) => {
          if (err2) {
            console.error("Erro search:", err2);
            imap.end();
            return res.status(500).json({ ok: false, error: String(err2) });
          }

          if (!results || results.length === 0) {
            imap.end();
            return res.status(200).json({ ok: true, message: "Nenhum e-mail novo para processar." });
          }

          const f = imap.fetch(results, { bodies: "", markSeen: true });
          f.on("message", (msg) => {
            msg.on("body", async (stream) => {
              try {
                const parsed = await simpleParser(stream);
                const from = parsed.from?.value?.[0]?.address || "";
                const subject = parsed.subject || "";
                const text = parsed.text || "";

                console.log(`📨 E-mail recebido de ${from} | assunto: "${subject}"`);

                // assunto esperado: REQ-CODE:CPF (ex: REQ-CODE:12345678900)
                const match = subject.match(/REQ-CODE[:\- ]*([0-9\.\-]+)/i);
                if (!match) {
                  console.log("Assunto não segue padrão esperado, ignorando.");
                  return;
                }

                const cpf = normalizeDigits(match[1]);
                if (!cpf) {
                  console.log("CPF inválido no assunto, ignorando.");
                  return;
                }

                // Verifica se o CPF está cadastrado no Redis
                const userKey = `user:${cpf}`;
                const userJson = await redis.get(userKey);

                if (!userJson) {
                  console.log(`❌ CPF ${cpf} não encontrado no Redis.`);
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/send-code`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      to: from,
                      subject: "Pedido não autorizado - código não encontrado",
                      body: `Não encontramos cadastro para o CPF informado (${cpf}).`,
                    }),
                  });
                  return;
                }

                let user: any = null;
                try {
                  user = JSON.parse(userJson);
                } catch {
                  console.log("Formato de usuário inválido no Redis.");
                  return;
                }

                // Busca o código da lavanderia
                const doorKey = process.env.DOOR_KEY || "door:lavanderia";
                const doorCode = await redis.get(doorKey);

                if (!doorCode) {
                  console.log("⚠️ Código da porta não encontrado no Redis.");
                  return;
                }

                // Monta resposta
                const replySubject = "CÓDIGO DE ACESSO - Lavanderia";
                const replyBody = [
                  `Olá ${user.name || ""},`,
                  ``,
                  `Recebemos sua solicitação.`,
                  `Segue o código de acesso:`,
                  ``,
                  `${doorCode}`,
                  ``,
                  `Atenciosamente,`,
                  `Administração do Condomínio`,
                ].join("\n");

                // Envia e-mail de resposta
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/send-code`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to: from,
                    subject: replySubject,
                    body: replyBody,
                  }),
                });

                console.log(`✅ Pedido processado para CPF ${cpf}, resposta enviada para ${from}`);
              } catch (errInner) {
                console.error("Erro ao processar mensagem:", errInner);
              }
            });
          });

          f.once("error", (errfetch) => {
            console.error("Fetch error:", errfetch);
          });

          f.once("end", () => {
            console.log("✅ Processamento concluído.");
            imap.end();
            return res.status(200).json({ ok: true, message: "Processamento finalizado." });
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP connection error", err);
      return res.status(500).json({ ok: false, error: String(err) });
    });

    imap.connect();
  } catch (err) {
    console.error("Unexpected error", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
