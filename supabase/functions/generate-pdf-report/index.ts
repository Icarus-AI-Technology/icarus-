// Edge Function: generate-pdf-report
// Geração de PDFs com Puppeteer (relatórios, contratos, notas fiscais)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { template, data, filename } = await req.json()

    // Renderizar HTML com template
    const html = renderTemplate(template, data)

    // Converter para PDF (stub - em produção usar Puppeteer via Docker)
    const pdfBuffer = await generatePDF(html)

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'relatorio.pdf'}"`,
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

function renderTemplate(template: string, data: Record<string, unknown>): string {
  // Template engine simples (em produção usar Handlebars/EJS)
  let html = template
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, String(value))
  }
  return html
}

async function generatePDF(html: string): Promise<Uint8Array> {
  // Stub - em produção chamar serviço externo ou Docker com Puppeteer
  const encoder = new TextEncoder()
  return encoder.encode(`<html>${html}</html>`)
}
