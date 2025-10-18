import type { NextApiRequest, NextApiResponse } from 'next'
import Imap from 'imap'
import { simpleParser } from 'mailparser'
import { Redis } from '@upstash/redis'

// Conexão com o Redis (Upstash)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Função auxiliar para limpar caracteres não numéricos
function normalizeDigits(s?: string) {
  return (s || '').replace(/\D/g, '')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cpf } = req.query

  if (!cpf || Array.isArray(cpf)) {
    return res.status(400).json({ error: 'cpf required' })
  }

  const cpfStr = String(cpf)

  try {
    const IMAP_USER = process.env.IMAP_USER
    const IMAP_PASS = process.env.IMAP_PASS

    // 🔒 Verificação de segurança — impede execução sem credenciais
    if (!IMAP_USER || !IMAP_PASS) {
      console.error('IMAP credentials not set')
      return res
        .status(500)
        .json({ verified: false, reason: 'imap_credentials_missing' })
    }

    // Conexão IMAP
    const imap = new Imap({
      user: IMAP_USER,
      password: IMAP_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
    })

    const openBox = () =>
      new Promise<void>((resolve, reject) => {
        imap.openBox('INBOX', false, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

    const searchMail = () =>
      new Promise<boolean>((resolve, reject) => {
        imap.search(['UNSEEN', ['SINCE', new Date(Date.now() - 5 * 60000)]], (err, results) => {
          if (err) return reject(err)
          if (!results || results.length === 0) return resolve(false)

          const fetcher = imap.fetch(results, { bodies: '' })
          let found = false

          fetcher.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) return
                const text = parsed.text || ''
                // O e-mail deve conter o identificador com o CPF
                if (text.includes(`VERIF:${cpfStr}`)) {
                  found = true
                }
              })
            })
          })

          fetcher.once('end', () => {
            resolve(found)
          })
        })
      })

    imap.once('ready', async () => {
      try {
        await openBox()
        const verified = await searchMail()
        imap.end()

        if (!verified) {
          return res.status(404).json({ verified: false })
        }

        // Se o e-mail foi encontrado, marca o usuário como verificado no Redis
        await redis.set(`verified:${cpfStr}`, true)
        return res.status(200).json({ verified: true })
      } catch (err) {
        console.error('IMAP check error', err)
        imap.end()
        return res.status(500).json({ verified: false, error: String(err) })
      }
    })

    imap.once('error', (err) => {
      console.error('IMAP connection error', err)
      return res.status(500).json({ verified: false, error: String(err) })
    })

    imap.connect()
  } catch (err) {
    console.error('Unexpected error', err)
    return res.status(500).json({ verified: false, error: String(err) })
  }
}
