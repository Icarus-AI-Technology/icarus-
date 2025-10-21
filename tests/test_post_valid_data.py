# Teste de POST com dados válidos para API
import json
import requests

def test_post_valid_data():
    """
    Teste o método POST com dados válidos
    Retorna 201 (Created) e corpo de resposta confirmando criação
    """
    # URL do endpoint correto
    url = "http://localhost:8000/api/items"
    
    # Cabeçalhos
    headers = {"Content-Type": "application/json"}
    
    # Carga útil válida
    payload = {
        "name": "Produto OPME Teste",
        "description": "Produto para teste de integração",
        "price": 150.00,
        "status": "active"
    }
    
    try:
        # Fazer requisição POST
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        
        # Verificar status code
        print(f"📊 Status Code: {response.status_code}")
        
        # Verificar se retornou 201 (Created)
        if response.status_code == 201:
            print(f"✅ POST bem-sucedido! Status 201 (Created)")
            data = response.json()
            print(f"📦 Resposta:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Validações adicionais
            assert "message" in data, "Resposta deve conter 'message'"
            assert "data" in data, "Resposta deve conter 'data'"
            assert data["data"]["id"] is not None, "Item criado deve ter ID"
            
            print(f"\n✅ Todas as validações passaram!")
            return True
        else:
            print(f"⚠️ Status inesperado: {response.status_code}")
            print(f"📦 Resposta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Erro de conexão: Servidor não está rodando")
        print(f"💡 Execute: python3 mock-api-server.py (porta 8000)")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Teste POST com dados válidos")
    print("=" * 70)
    result = test_post_valid_data()
    print("=" * 70)
    print(f"\n{'✅ TESTE PASSOU' if result else '❌ TESTE FALHOU'}")
