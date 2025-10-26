#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2] || '.';
function walk(d){let r=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?r=r.concat(walk(p)):r.push(p)}return r}
const targets=['supabase/migrations','supabase/seed','tools/sql'];
const files=[];for(const t of targets){const p=path.join(root,t);if(fs.existsSync(p))files.push(...walk(p).filter(f=>f.endsWith('.sql')))};
files.sort((a,b)=>a.localeCompare(b));
const seen=new Set(),dups=[];for(const f of files){const b=path.basename(f);if(seen.has(b))dups.push(b);seen.add(b)}
console.log('Total SQL:', files.length);
if(dups.length){console.log('Duplicados:', dups); process.exit(2)} else {console.log('OK sem duplicados');}
