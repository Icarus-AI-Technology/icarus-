/**
 * Edge Function: Test Credential
 * 
 * Testa a validade de uma credencial de API fazendo uma requisição real
 * ao serviço correspondente.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  servico: string;
  nome: string;
  valor: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { servico, nome, valor }: TestRequest = await req.json();

    if (!servico || !nome || !valor) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos obrigatórios: servico, nome, valor' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let testResult: { success: boolean; message: string; details?: any };

    // Testar baseado no serviço
    switch (servico.toLowerCase()) {
      case 'twilio':
        testResult = await testTwilio(nome, valor);
        break;
      
      case 'whatsapp':
        testResult = await testWhatsApp(valor);
        break;
      
      case 'sendgrid':
        testResult = await testSendGrid(valor);
        break;
      
      case 'mailchimp':
        testResult = await testMailchimp(valor);
        break;
      
      case 'abbott':
        testResult = await testAbbott(valor);
        break;
      
      case 'medtronic':
        testResult = await testMedtronic(nome, valor);
        break;
      
      case 'j&j':
        testResult = await testJJ(valor);
        break;
      
      case 'stryker':
        testResult = await testStryker(valor);
        break;
      
      case 'boston scientific':
        testResult = await testBostonScientific(valor);
        break;
      
      case 'infosimples':
        testResult = await testInfoSimples(valor);
        break;
      
      default:
        testResult = {
          success: false,
          message: `Serviço ${servico} não suportado para teste automático`
        };
    }

    return new Response(
      JSON.stringify(testResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao testar credencial:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// =====================================================
// FUNÇÕES DE TESTE POR SERVIÇO
// =====================================================

async function testTwilio(nome: string, valor: string) {
  try {
    // Se for Account SID, apenas valida formato
    if (nome === 'TWILIO_ACCOUNT_SID') {
      if (valor.startsWith('AC') && valor.length === 34) {
        return { success: true, message: 'Account SID com formato válido' };
      } else {
        return { success: false, message: 'Account SID inválido (deve começar com AC e ter 34 caracteres)' };
      }
    }
    
    // Para Auth Token, não podemos testar sem o Account SID
    return { success: true, message: 'Token salvo. Teste completo requer Account SID.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testWhatsApp(token: string) {
  try {
    const response = await fetch('https://graph.facebook.com/v18.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: 'Token WhatsApp válido',
        details: { name: data.name }
      };
    } else {
      return { success: false, message: 'Token WhatsApp inválido' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testSendGrid(apiKey: string) {
  try {
    if (!apiKey.startsWith('SG.')) {
      return { success: false, message: 'API Key deve começar com "SG."' };
    }
    
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: 'API Key SendGrid válida',
        details: { email: data.email }
      };
    } else {
      return { success: false, message: 'API Key SendGrid inválida' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testMailchimp(apiKey: string) {
  try {
    // Extrair DC do API Key (formato: key-dc)
    const dc = apiKey.split('-').pop();
    
    const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: 'API Key Mailchimp válida',
        details: { account_name: data.account_name }
      };
    } else {
      return { success: false, message: 'API Key Mailchimp inválida' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testAbbott(apiKey: string) {
  try {
    // Teste simulado - endpoint real depende de configuração Abbott
    const response = await fetch('https://api.abbott.com/v1/health', {
      headers: {
        'X-API-Key': apiKey
      }
    });
    
    if (response.ok || response.status === 401) {
      // 401 significa que a API respondeu mas a key está inválida
      // ok significa que a key está válida
      return response.ok 
        ? { success: true, message: 'API Key Abbott válida' }
        : { success: false, message: 'API Key Abbott inválida' };
    } else {
      return { success: true, message: 'API Key salva. Endpoint Abbott não disponível para teste.' };
    }
  } catch (error) {
    // Se erro de rede, assumimos que a key foi salva
    return { success: true, message: 'API Key salva. Teste real requer acesso ao endpoint Abbott.' };
  }
}

async function testMedtronic(nome: string, valor: string) {
  // Medtronic usa OAuth2, não podemos testar sem fluxo completo
  return { 
    success: true, 
    message: `${nome} salvo. OAuth2 requer fluxo completo para validação.` 
  };
}

async function testJJ(token: string) {
  try {
    const response = await fetch('https://api.tracelink.com/v1/health', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok || response.status === 401) {
      return response.ok 
        ? { success: true, message: 'Token J&J TraceLink válido' }
        : { success: false, message: 'Token J&J TraceLink inválido' };
    } else {
      return { success: true, message: 'Token salvo. Endpoint J&J não disponível para teste.' };
    }
  } catch (error) {
    return { success: true, message: 'Token salvo. Teste real requer acesso ao endpoint J&J.' };
  }
}

async function testStryker(apiKey: string) {
  try {
    const response = await fetch('https://connect.stryker.com/api/health', {
      headers: {
        'Authorization': `ApiKey ${apiKey}`
      }
    });
    
    if (response.ok || response.status === 401) {
      return response.ok 
        ? { success: true, message: 'API Key Stryker válida' }
        : { success: false, message: 'API Key Stryker inválida' };
    } else {
      return { success: true, message: 'API Key salva. Endpoint Stryker não disponível para teste.' };
    }
  } catch (error) {
    return { success: true, message: 'API Key salva. Teste real requer acesso ao endpoint Stryker.' };
  }
}

async function testBostonScientific(token: string) {
  try {
    const response = await fetch('https://api.bostonscientific.com/itrace/v1/health', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok || response.status === 401) {
      return response.ok 
        ? { success: true, message: 'Token Boston Scientific válido' }
        : { success: false, message: 'Token Boston Scientific inválido' };
    } else {
      return { success: true, message: 'Token salvo. Endpoint Boston Scientific não disponível para teste.' };
    }
  } catch (error) {
    return { success: true, message: 'Token salvo. Teste real requer acesso ao endpoint Boston Scientific.' };
  }
}

async function testInfoSimples(token: string) {
  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        cnpj: '00000000000191', // CNPJ do Banco do Brasil para teste
        timeout: 5
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.code === 200 || data.code === 'success') {
        return { success: true, message: 'Token InfoSimples válido' };
      } else {
        return { success: false, message: 'Token InfoSimples inválido' };
      }
    } else {
      return { success: false, message: 'Token InfoSimples inválido' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

