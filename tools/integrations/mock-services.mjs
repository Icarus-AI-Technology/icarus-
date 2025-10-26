#!/usr/bin/env node

// Lightweight mock services for local QA without Docker
import http from 'http';
import fs from 'fs';
import path from 'path';

const meiliPort = parseInt(process.env.MEILI_PORT || '7700', 10);
const ollamaPort = parseInt(process.env.OLLAMA_PORT || '11434', 10);
const emailPort = parseInt(process.env.EMAIL_HTTP_PORT || '8025', 10);
const bullPort = parseInt(process.env.BULL_HTTP_PORT || '9900', 10);

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Meili mock
const meiliServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return json(res, 200, { status: 'ok' });
  }
  if (req.method === 'GET' && req.url === '/indexes') {
    return json(res, 200, { results: [ { uid: 'produtos' }, { uid: 'cirurgias' } ] });
  }
  if (req.method === 'POST' && /\/indexes\/.+\/documents/.test(req.url || '')) {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => json(res, 202, { taskUid: Date.now(), accepted: true }));
    return;
  }
  if (req.method === 'POST' && /\/indexes\/.+\/search/.test(req.url || '')) {
    return json(res, 200, { hits: [], estimatedTotalHits: 0 });
  }
  json(res, 404, { error: 'not_found' });
});

// Ollama mock
const ollamaServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/tags') {
    return json(res, 200, { models: [{ name: 'llama3.1' }] });
  }
  if (req.method === 'POST' && req.url === '/api/generate') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => json(res, 200, { response: 'ok', done: true }));
    return;
  }
  json(res, 404, { error: 'not_found' });
});

// Email HTTP mock
const emailLogPath = path.join(process.cwd(), 'email-mock.log');
const emailServer = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        fs.appendFileSync(emailLogPath, body + '\n');
      } catch {}
      json(res, 200, { ok: true });
    });
    return;
  }
  if (req.method === 'GET' && req.url === '/health') {
    return json(res, 200, { status: 'ok' });
  }
  json(res, 404, { error: 'not_found' });
});

// BullMQ mock
const bullServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/queue/ping') {
    return json(res, 200, { ok: true });
  }
  json(res, 404, { error: 'not_found' });
});

meiliServer.listen(meiliPort, () => console.log(`[mocks] Meili @ http://localhost:${meiliPort}`));
ollamaServer.listen(ollamaPort, () => console.log(`[mocks] Ollama @ http://localhost:${ollamaPort}`));
emailServer.listen(emailPort, () => console.log(`[mocks] Email @ http://localhost:${emailPort}`));
bullServer.listen(bullPort, () => console.log(`[mocks] BullMQ @ http://localhost:${bullPort}`));

process.on('SIGINT', () => {
  meiliServer.close();
  ollamaServer.close();
  emailServer.close();
  bullServer.close();
  process.exit(0);
});
