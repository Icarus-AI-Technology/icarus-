"""
Servidor Mock API para testes - ICARUS v5.0
Porta: 3000
"""
from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Mock database
database = []

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "ICARUS Mock API v5.0",
        "status": "online",
        "endpoints": {
            "POST /api/items": "Criar novo item",
            "GET /api/items": "Listar todos os itens"
        }
    })

@app.route('/api/items', methods=['POST'])
def create_item():
    """Aceita POST com dados válidos e retorna 201"""
    try:
        data = request.get_json()
        
        # Validação básica
        if not data:
            return jsonify({"error": "Dados inválidos"}), 400
        
        # Criar novo item
        new_item = {
            "id": len(database) + 1,
            "created_at": datetime.now().isoformat(),
            **data
        }
        
        database.append(new_item)
        
        return jsonify({
            "message": "Item criado com sucesso",
            "data": new_item
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items', methods=['GET'])
def list_items():
    """Lista todos os itens"""
    return jsonify({
        "total": len(database),
        "items": database
    }), 200

if __name__ == '__main__':
    print("🚀 Iniciando Mock API ICARUS na porta 8000...")
    app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False)

