// Edge Function: validate-anvisa-product
// Validação de produtos na base ANVISA (API pública)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { registro_anvisa, tipo_produto } = await req.json()

    // API pública ANVISA (Dataviva)
    const response = await fetch(
      `https://consultas.anvisa.gov.br/api/consulta/medicamentos?filter[numeroRegistro]=${registro_anvisa}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ao consultar ANVISA: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.content.length === 0) {
      return new Response(JSON.stringify({
        valido: false,
        mensagem: 'Registro ANVISA não encontrado',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const produto = data.content[0]

    return new Response(JSON.stringify({
      valido: true,
      dados: {
        registro: produto.numeroRegistro,
        nome: produto.nomeProduto,
        fabricante: produto.nomeFabricante,
        categoria: produto.categoriaProduto,
        situacao: produto.situacaoRegistro,
        vencimento: produto.dataVencimentoRegistro,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

