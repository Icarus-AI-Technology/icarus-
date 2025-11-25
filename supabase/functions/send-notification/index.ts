// Edge Function: send-notification
// Envio de notificações via email (Resend) e SMS (Twilio)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!

interface NotificationRequest {
  type: 'email' | 'sms' | 'push'
  to: string
  subject?: string
  message: string
  template?: string
  data?: Record<string, unknown>
}

serve(async (req) => {
  try {
    const { type, to, subject, message, template, data }: NotificationRequest = await req.json()

    if (type === 'email') {
      // Enviar via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ICARUS <noreply@icarus.app>',
          to: [to],
          subject: subject || 'Notificação ICARUS',
          html: message,
        }),
      })

      const result = await response.json()
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (type === 'sms') {
      // Enviar via Twilio
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: '+55119xxxxxxxx', // Número Twilio
            Body: message,
          }),
        }
      )

      const result = await response.json()
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Tipo de notificação inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
