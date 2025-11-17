/**
 * Página: Diagrama de Integrações Externas
 * Exibe integrações com IoT/RFID/Blockchain, Fornecedores e Órgãos Regulatórios
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/oraclusx-ds";
import {
  Network,
  Wifi,
  Shield,
  ShoppingCart,
  Database,
  Link,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function IntegrationsDiagram() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-heading flex items-center gap-2">
              <Network size={28} />
              Integrações Externas ICARUS v5.0
            </CardTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              Diagrama completo de integrações: IoT/RFID/Blockchain,
              Fornecedores e Órgãos Regulatórios.
            </p>
          </CardHeader>
        </Card>

        {/* Diagrama Principal */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link size={24} />
              Arquitetura de Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <pre className="mermaid text-sm">
                {`graph LR
  subgraph IoT_RFID_Blockchain
    IoT[IoT / RFID Readers] -->|Envio de dados| Blockchain[Blockchain Ledger]
    Blockchain -->|Consulta histórica| ERP_Backend[ERP / OraclusX Backend]
  end

  subgraph Fornecedores_Mercado
    Fornecedores[Fornecedores OPME] -->|API / dados web| Benchmark[Benchmark Externo]
    Benchmark -->|Relatórios & comparativos| ERP_Backend
  end

  subgraph Regulatório
    ANVISA[ANVISA / UDI] -->|Registros & rastreio| ERP_Backend
    Certificacoes[Certificações ISO / Boas Práticas] -->|Auditoria| ERP_Backend
  end

  ERP_Backend --> Dashboard[Dashboard ICARUS]
  Dashboard --> Usuarios[Usuário Hospital/Distribuidor]`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Categorias de Integrações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* IoT/RFID/Blockchain */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi size={20} className="text-blue-500" />
                IoT/RFID/Blockchain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Rastreabilidade em tempo real de dispositivos médicos
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>
                    IoT Readers: Sensores de temperatura e localização
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>RFID: Tracking automático de estoque</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Blockchain: Imutabilidade de registros críticos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Smart Contracts: Automação de processos</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Fornecedores e Mercado */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart size={20} className="text-green-500" />
                Fornecedores & Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Integração com fornecedores e análise de mercado
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>APIs de Fornecedores: Catálogos e preços</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Benchmark Externo: Comparativo de preços</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Web Scraping: Dados de mercado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>EDI (Electronic Data Interchange)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Regulatório */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={20} className="text-red-500" />
                Compliance & Regulatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground mb-3">
                Conformidade com órgãos reguladores
              </p>
              <ul className="space-y-2 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>ANVISA: Validação de UDI e Device Registry</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>SEFAZ: Integração com NFe/NFSe</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>ISO 13485: Certificações médicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span>Boas Práticas: Auditoria e compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento de Integrações */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Detalhamento das Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* IoT/RFID/Blockchain */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <Wifi size={18} />
                  1. IoT/RFID/Blockchain
                </h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-body-sm mb-3">
                    <strong>Objetivo:</strong> Rastreabilidade end-to-end de
                    dispositivos médicos com garantia de imutabilidade.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Tecnologias Utilizadas
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• Ethereum/Hyperledger para Blockchain</li>
                        <li>• RFID Tags (EPC Gen2)</li>
                        <li>• Sensores IoT (temperatura, localização)</li>
                        <li>• MQTT Protocol para comunicação</li>
                        <li>• Smart Contracts para automação</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Casos de Uso
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• Tracking de OPME em cirurgias</li>
                        <li>• Controle de temperatura de produtos sensíveis</li>
                        <li>• Auditoria de movimentações</li>
                        <li>• Prevenção de falsificações</li>
                        <li>• Recall automatizado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fornecedores */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart size={18} />
                  2. Fornecedores & Benchmark de Mercado
                </h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-body-sm mb-3">
                    <strong>Objetivo:</strong> Automatizar cotações, comparar
                    preços e otimizar compras.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        APIs Integradas
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• Fornecedores OPME (APIs REST/GraphQL)</li>
                        <li>• Web Scraping de marketplaces</li>
                        <li>• EDI para grandes distribuidores</li>
                        <li>• Catálogos eletrônicos</li>
                        <li>• Sistemas ERP de fornecedores</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Benefícios
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• Redução de 30% no tempo de cotação</li>
                        <li>• Análise comparativa automática</li>
                        <li>• Alertas de variação de preço</li>
                        <li>• Histórico de compras e tendências</li>
                        <li>• Negociação baseada em dados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatório */}
              <div>
                <h4 className="text-body-md font-semibold mb-3 flex items-center gap-2">
                  <Shield size={18} />
                  3. Compliance & Órgãos Regulatórios
                </h4>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-body-sm mb-3">
                    <strong>Objetivo:</strong> Garantir conformidade total com
                    legislação e normas do setor.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Integrações Regulatórias
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• ANVISA (API UDI e Device Registry)</li>
                        <li>• SEFAZ (NFe, NFSe, CTe)</li>
                        <li>• Receita Federal (CNPJ, Situação Cadastral)</li>
                        <li>• Vigilância Sanitária Estadual/Municipal</li>
                        <li>
                          • Sistema Nacional de Gerenciamento de Produtos
                          (SNGPC)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-sm mb-2">
                        Certificações
                      </h5>
                      <ul className="text-body-xs space-y-1 text-muted-foreground">
                        <li>• ISO 13485 (Dispositivos Médicos)</li>
                        <li>• ISO 9001 (Gestão da Qualidade)</li>
                        <li>• RDC 16/2013 (Boas Práticas)</li>
                        <li>• LGPD (Proteção de Dados)</li>
                        <li>• HIPAA Ready (Dados de Saúde)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status das Integrações */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database size={24} />
              Status das Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "ANVISA UDI API", status: "online", uptime: "99.2%" },
                { name: "SEFAZ NFe", status: "online", uptime: "98.8%" },
                {
                  name: "Blockchain Network",
                  status: "online",
                  uptime: "99.9%",
                },
                {
                  name: "IoT Readers (MQTT)",
                  status: "online",
                  uptime: "97.5%",
                },
                {
                  name: "Fornecedores APIs",
                  status: "degraded",
                  uptime: "95.3%",
                },
                { name: "Brasil API", status: "online", uptime: "99.7%" },
              ].map((integration, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {integration.status === "online" ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={20} className="text-yellow-500" />
                    )}
                    <span className="text-body-md font-medium">
                      {integration.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-body-sm text-muted-foreground">
                      Uptime: {integration.uptime}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-body-xs font-semibold ${
                        integration.status === "online"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {integration.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
