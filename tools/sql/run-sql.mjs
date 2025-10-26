#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { Client } from 'pg';
const DRY = process.env.DRY_RUN==='1';
const ROOTS=[process.env.SQL_ROOT||'/users/daxmeneghel/icarus-make/supabase/migrations','/users/daxmeneghel/icarus-make/supabase/seed','/users/daxmeneghel/icarus-make/tools/sql'];
const DATABASE_URL=process.env.DATABASE_URL; if(!DATABASE_URL){console.error('DATABASE_URL não definido');process.exit(1)}
function walk(d){let r=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?r=r.concat(walk(p)):r.push(p)}return r}
const files=[];for(const r of ROOTS){if(fs.existsSync(r))files.push(...walk(r).filter(f=>f.endsWith('.sql')))};files.sort((a,b)=>a.localeCompare(b));
const report={startedAt:new Date().toISOString(),files:[],ok:0,fail:0};
const client=new Client({connectionString:DATABASE_URL,ssl:{rejectUnauthorized:false}});
(async()=>{await client.connect();for(const file of files){const sql=fs.readFileSync(file,'utf8');const entry={file,ok:false,error:null,ms:0};const t0=Date.now();try{if(DRY){entry.ok=true}else{await client.query('BEGIN');await client.query('SAVEPOINT before_file');await client.query(sql);await client.query('RELEASE SAVEPOINT before_file');await client.query('COMMIT');entry.ok=true}entry.ms=Date.now()-t0;report.ok++;console.log('OK',path.basename(file),entry.ms+'ms')}catch(e){report.fail++;entry.error=String(e);entry.ms=Date.now()-t0;console.error('FAIL',path.basename(file),e.message||e);try{await client.query('ROLLBACK')}catch{} }finally{report.files.push(entry)}}await client.end();const out='docs/db';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'exec-report.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(out,'exec-report.md'),`# Execução SQL\nSucesso: ${report.ok}\nFalhas: ${report.fail}\n`);process.exit(report.fail?2:0)})().catch(e=>{console.error('Erro geral',e);process.exit(1)});
