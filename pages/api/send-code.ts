// pages/api/send-code.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const { to, subject, body } = req.body || {}

  if (!to || !subject || !body) {
    return res.status(400).json({ ok: false, error: 'to, subject e body são obrigatórios' })
  }

  const SMTP_HOST = process.env.SMTP_HOST
  const SMTP_PORT = Number(process.env.SMTP_PORT || 465)
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const FROM = process.env.EMAIL_FROM || SMTP_USER

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ ok: false, error: "Config SMTP incompleta nas variáveis de ambiente" })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      text: body,
      html: `<pre style="font-family: inherit; white-space: pre-wrap;">${String(body)}</pre>`
    })

    return res.status(200).json({ ok: true, message: 'Enviado' })
  } catch (err) {
    console.error('Erro envio SMTP', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
