#!/usr/bin/env python3
"""
Servidor Mock GPT Researcher
Simula o comportamento do servidor GPT Researcher para testes
"""

import json
import asyncio
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time

class MockGPTResearcherHandler(BaseHTTPRequestHandler):
    """Handler para simular as respostas do GPT Researcher"""
    
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self._set_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self._set_headers()
            response = {"status": "healthy", "version": "mock-1.0.0"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode())
            task = data.get('task', 'No task provided')
            
            self._set_headers()
            
            # Simular resposta de pesquisa
            response = {
                "status": "completed",
                "task": task,
                "report": self._generate_mock_report(task),
                "sources": [
                    "https://example.com/source1",
                    "https://example.com/source2",
                    "https://example.com/source3"
                ],
                "metadata": {
                    "duration": "2.5s",
                    "sources_count": 3,
                    "mock": True
                }
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self._set_headers(500)
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def _generate_mock_report(self, task):
        """Gera um relatório mock baseado na tarefa"""
        return f"""
# Relatório de Pesquisa Mock

## Tarefa
{task}

## Resumo
Este é um servidor mock do GPT Researcher. Ele simula as respostas do servidor real para 
permitir que você teste a interface do chatbot sem precisar configurar o servidor completo.

## Resultados Simulados

### Ponto 1
Esta é uma resposta simulada para sua pergunta. Em um ambiente real, o GPT Researcher 
faria uma pesquisa profunda na web e retornaria informações factuais e atualizadas.

### Ponto 2
O servidor mock permite testar toda a interface do usuário, incluindo:
- Envio de mensagens
- Recebimento de respostas
- Visualização de fontes
- Logs de pesquisa

### Ponto 3
Para usar o servidor real do GPT Researcher:
1. Instale Python 3.10+
2. Execute: pip install gpt-researcher
3. Configure sua API key
4. Inicie o servidor na porta 8000

## Fontes
- https://example.com/source1
- https://example.com/source2
- https://example.com/source3

## Conclusão
Este é um relatório de demonstração. Substitua este servidor mock pelo servidor real 
quando estiver pronto para fazer pesquisas reais.

---
*Gerado por: Mock GPT Researcher Server*
*Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}*
        """.strip()
    
    def log_message(self, format, *args):
        """Customiza as mensagens de log"""
        print(f"[{time.strftime('%H:%M:%S')}] {format % args}")


def run_server(port=8000):
    """Inicia o servidor mock"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockGPTResearcherHandler)
    
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║         🤖 Mock GPT Researcher Server                        ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()
    print(f"✅ Servidor rodando em: http://localhost:{port}")
    print(f"✅ Health check: http://localhost:{port}/health")
    print()
    print("⚠️  ATENÇÃO: Este é um servidor MOCK para testes!")
    print("   Para pesquisas reais, use o servidor GPT Researcher oficial.")
    print()
    print("📝 Logs:")
    print("-" * 64)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n")
        print("🛑 Servidor encerrado.")
        httpd.shutdown()


if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

