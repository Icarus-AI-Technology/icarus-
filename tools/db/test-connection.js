#!/usr/bin/env node
/**
 * 🔍 TESTE DE CONEXÃO — Supabase
 */

const connectionString = "postgresql://postgres:[%Ortho#New&25']@db.ttswvavcisdnonytslom.supabase.co:5432/postgres";

// Extrair senha da URL
const match = connectionString.match(/postgres:(.+)@/);
if (match) {
  const rawPassword = match[1];
  console.log('🔑 Senha raw:', rawPassword);
  console.log('🔑 Senha decoded:', decodeURIComponent(rawPassword));
}

// Testar conexão
import('pg').then(async ({ default: pkg }) => {
  const { Client } = pkg;
  
  const client = new Client({
    host: 'db.ttswvavcisdnonytslom.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: decodeURIComponent(match[1]),
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('\n📡 Conectando...');
    await client.connect();
    console.log('✅ CONECTADO!');
    
    const result = await client.query('SELECT NOW()');
    console.log('🕐 Hora do servidor:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
});

