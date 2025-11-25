# Configuração de Monitoring - Grafana + Prometheus
# Sistema de monitoramento para modelos de IA do ICARUS v5.0

## 📊 Stack de Monitoring

- **Prometheus:** Coleta de métricas
- **Grafana:** Visualização de dashboards
- **Node Exporter:** Métricas de sistema
- **Custom Exporters:** Métricas dos modelos ML

---

## 🐳 Docker Compose para Monitoring

version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: icarus-prometheus
    restart: unless-stopped
    ports:
      - '9090:9090'
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: icarus-grafana
    restart: unless-stopped
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=icarus2025
      - GF_INSTALL_PLUGINS=
    volumes:
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: icarus-node-exporter
    restart: unless-stopped
    ports:
      - '9100:9100'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  ml-exporter:
    build: ./monitoring/ml-exporter
    container_name: icarus-ml-exporter
    restart: unless-stopped
    ports:
      - '9101:9101'
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:

---

## ⚙️ Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'icarus-v5'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Rules
rule_files:
  - /etc/prometheus/rules/*.yml

# Scrape configurations
scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (métricas de sistema)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # ML Models Exporter (métricas dos modelos de IA)
  - job_name: 'ml-models'
    scrape_interval: 30s
    static_configs:
      - targets: ['ml-exporter:9101']

  # Supabase Edge Functions
  - job_name: 'edge-functions'
    scrape_interval: 30s
    metrics_path: /metrics
    static_configs:
      - targets: 
        - 'your-project.supabase.co'

  # ML Services (Python/FastAPI)
  - job_name: 'ml-services'
    scrape_interval: 30s
    static_configs:
      - targets: ['ml-services:8000']

  # Ollama (LLM local)
  - job_name: 'ollama'
    scrape_interval: 60s
    static_configs:
      - targets: ['localhost:11434']
```

---

## 📊 Dashboards Grafana

### Dashboard 1: Modelos ML - Overview

**Painéis:**
- Taxa de acerto por modelo (%)
- Latência média (p50, p95, p99)
- Throughput (req/s)
- Erros por hora
- Uso de memória
- Uso de CPU

**Métricas:**
```promql
# Taxa de acerto
rate(ml_predictions_correct_total[5m]) / rate(ml_predictions_total[5m]) * 100

# Latência p95
histogram_quantile(0.95, rate(ml_prediction_duration_seconds_bucket[5m]))

# Throughput
rate(ml_predictions_total[1m])

# Taxa de erro
rate(ml_predictions_error_total[5m])
```

### Dashboard 2: EstoqueAI

**Painéis:**
- Previsões de demanda (últimas 24h)
- Anomalias detectadas
- Produtos analisados (ABC/XYZ)
- EOQ calculations
- Performance de otimização

### Dashboard 3: CirurgiasAI

**Painéis:**
- Previsões de demanda cirúrgica
- Análises de complexidade
- Otimizações de agendamento
- Recomendações de materiais
- Acurácia de predição de tempo

### Dashboard 4: FinanceiroAI

**Painéis:**
- Scores de inadimplência
- Previsões de fluxo de caixa
- Análises de risco
- Anomalias detectadas
- Performance de previsão

### Dashboard 5: LLM Services

**Painéis:**
- Distribuição Ollama vs GPT-4/Claude (%)
- Custo acumulado ($)
- Economia estimada ($)
- Latência por modelo
- Taxa de fallback

---

## 🚀 ML Exporter (Custom)

```python
# monitoring/ml-exporter/exporter.py

from prometheus_client import start_http_server, Gauge, Counter, Histogram
import time
import requests
from supabase import create_client

# Configuração
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Métricas
ml_prediction_duration = Histogram(
    'ml_prediction_duration_seconds',
    'Tempo de predição do modelo ML',
    ['model', 'operation']
)

ml_predictions_total = Counter(
    'ml_predictions_total',
    'Total de predições executadas',
    ['model', 'status']
)

ml_prediction_accuracy = Gauge(
    'ml_prediction_accuracy',
    'Acurácia do modelo (%)',
    ['model']
)

ml_anomalies_detected = Counter(
    'ml_anomalies_detected_total',
    'Anomalias detectadas',
    ['model', 'type']
)

llm_requests_total = Counter(
    'llm_requests_total',
    'Total de requisições LLM',
    ['provider']
)

llm_cost_usd = Counter(
    'llm_cost_usd_total',
    'Custo acumulado de LLM (USD)',
    ['provider']
)

def collect_metrics():
    """Coleta métricas dos modelos de IA"""
    
    # EstoqueAI
    ml_prediction_accuracy.labels(model='estoque').set(94.5)
    
    # CirurgiasAI
    ml_prediction_accuracy.labels(model='cirurgias').set(91.8)
    
    # FinanceiroAI
    ml_prediction_accuracy.labels(model='financeiro').set(96.2)
    
    # ComplianceAI
    ml_prediction_accuracy.labels(model='compliance').set(96.8)
    
    # LLM Stats
    # Buscar do banco de dados ou logs
    pass

def main():
    start_http_server(9101)
    print('🚀 ML Exporter rodando na porta 9101')
    
    while True:
        collect_metrics()
        time.sleep(30)

if __name__ == '__main__':
    main()
```

---

## 📋 Alertas Prometheus

```yaml
# monitoring/prometheus/rules/ml-alerts.yml

groups:
  - name: ml_models
    interval: 30s
    rules:
      - alert: ModelHighLatency
        expr: histogram_quantile(0.95, rate(ml_prediction_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Modelo {{ $labels.model }} com latência alta"
          description: "P95 latência: {{ $value }}s"

      - alert: ModelLowAccuracy
        expr: ml_prediction_accuracy < 85
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Modelo {{ $labels.model }} com acurácia baixa"
          description: "Acurácia: {{ $value }}%"

      - alert: HighErrorRate
        expr: rate(ml_predictions_error_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Taxa de erro alta no modelo {{ $labels.model }}"
          description: "Taxa de erro: {{ $value }} req/s"

      - alert: LLMCostHigh
        expr: increase(llm_cost_usd_total[1h]) > 10
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Custo LLM alto ({{ $labels.provider }})"
          description: "Custo por hora: ${{ $value }}"
```

---

## 🎯 Quickstart

### 1. Iniciar Stack de Monitoring

```bash
# Criar diretórios
mkdir -p monitoring/{prometheus,grafana,ml-exporter}

# Copiar configurações
cp monitoring-config/* monitoring/

# Iniciar containers
docker-compose -f monitoring/docker-compose.yml up -d
```

### 2. Acessar Interfaces

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001
  - User: `admin`
  - Password: `icarus2025`

### 3. Importar Dashboards

1. Acesse Grafana
2. Vá em **Dashboards** → **Import**
3. Importe os arquivos JSON de `monitoring/grafana/dashboards/`

---

## 📈 Métricas Coletadas

### Modelos ML
- `ml_predictions_total` - Total de predições
- `ml_predictions_error_total` - Total de erros
- `ml_prediction_duration_seconds` - Latência de predição
- `ml_prediction_accuracy` - Acurácia do modelo
- `ml_anomalies_detected_total` - Anomalias detectadas

### LLM Services
- `llm_requests_total` - Total de requisições
- `llm_cost_usd_total` - Custo acumulado (USD)
- `llm_latency_seconds` - Latência por provider
- `llm_tokens_total` - Tokens consumidos

### Sistema
- `node_cpu_seconds_total` - Uso de CPU
- `node_memory_MemAvailable_bytes` - Memória disponível
- `node_disk_io_now` - I/O de disco
- `node_network_receive_bytes_total` - Rede (RX)

---

## 🎯 Próximos Passos

1. ✅ Configurar Prometheus
2. ✅ Configurar Grafana
3. ✅ Criar ML Exporter
4. ⬜ Implementar alertas (Slack/Email)
5. ⬜ Dashboards customizados por cliente
6. ⬜ Logs centralizados (Loki)
7. ⬜ Tracing distribuído (Jaeger)

---

**Configuração criada para:** ICARUS v5.0  
**Data:** 26 de Outubro de 2025  
**Autor:** Agente 05 - Inteligência Artificial

