# 🔗 ESTRATÉGIA DE APIs E INTEGRAÇÕES — ICARUS v5.0

**Sistema**: ICARUS v5.0 — Gestão elevada pela IA  
**Data**: 20 de Outubro de 2025  
**Tipo**: Arquitetura de APIs, Microsserviços e Integrações Externas

---

## 🎯 VISÃO GERAL

O ICARUS v5.0 implementa uma **arquitetura híbrida de APIs** que combina:
- **GraphQL** para comunicação frontend ↔ backend (flexibilidade, performance)
- **REST/gRPC** para comunicação interna entre microsserviços
- **Webhooks** para eventos assíncronos e integrações externas
- **Message Brokers (RabbitMQ/Redis)** para filas e processamento assíncrono

### Princípios de Design

1. ✅ **API-First**: Todas as funcionalidades acessíveis via API
2. 🔒 **Security by Default**: Autenticação/autorização obrigatória
3. 📊 **Observabilidade**: Logs, métricas e tracing completos
4. 🚀 **Performance**: Cache agressivo, rate limiting, otimização de queries
5. 📚 **Documentação Viva**: OpenAPI/Swagger + GraphQL Playground
6. 🔄 **Versionamento**: Compatibilidade retroativa garantida

---

## 🏗️ ARQUITETURA DE APIs

### 1. API GraphQL Principal (Frontend ↔ Backend)

**Por que GraphQL?**
- ✅ Frontend solicita **exatamente** os dados necessários (reduz over/under-fetching)
- ✅ Single endpoint (`/graphql`)
- ✅ Type-safe (schema fortemente tipado)
- ✅ Real-time via subscriptions (WebSocket)
- ✅ Facilita desenvolvimento frontend (Apollo Client)

#### Schema GraphQL — Exemplo

```graphql
# =========================================
# TYPES
# =========================================

type User {
  id: ID!
  nome: String!
  email: String!
  cargo: String!
  departamento: String!
  permissoes: [String!]!
  avatar: String
  ativo: Boolean!
  criadoEm: DateTime!
  atualizadoEm: DateTime!
}

type Medico {
  id: ID!
  nome: String!
  crm: String!
  especialidades: [String!]!
  telefone: String
  email: String
  hospitais: [Hospital!]!
  equipes: [EquipeMedica!]!
  cirurgiasAgendadas: [Cirurgia!]!
}

type Hospital {
  id: ID!
  razaoSocial: String!
  cnpj: String!
  cnes: String!
  endereco: Endereco!
  telefones: [String!]!
  email: String
  medicos: [Medico!]!
}

type Cirurgia {
  id: ID!
  paciente: Paciente!
  medico: Medico!
  hospital: Hospital!
  dataAgendamento: DateTime!
  procedimento: String!
  status: CirurgiaStatus!
  equipeMedica: EquipeMedica
  materiaisOPME: [MaterialOPME!]!
  custoEstimado: Float
  valorFaturado: Float
}

enum CirurgiaStatus {
  AGENDADA
  CONFIRMADA
  EM_ANDAMENTO
  CONCLUIDA
  CANCELADA
}

type ProdutoOPME {
  id: ID!
  codigoInterno: String!
  descricao: String!
  codigoANVISA: String!
  codigoTUSS: String
  fornecedor: Fornecedor!
  precoCompra: Float!
  precoVenda: Float!
  estoque: EstoqueInfo!
  rastreabilidade: [RastreabilidadeItem!]!
}

type EstoqueInfo {
  quantidade: Int!
  minimoEstoque: Int!
  maximoEstoque: Int!
  ultimaMovimentacao: DateTime
  proximoVencimento: DateTime
  alertas: [AlertaEstoque!]!
}

# =========================================
# QUERIES
# =========================================

type Query {
  # Usuários e autenticação
  me: User!
  usuario(id: ID!): User
  usuarios(filtro: UsuarioFiltro, paginacao: Paginacao): UsuarioConnection!
  
  # Cadastros
  medico(id: ID, crm: String): Medico
  medicos(filtro: MedicoFiltro, paginacao: Paginacao): MedicoConnection!
  
  hospital(id: ID, cnpj: String, cnes: String): Hospital
  hospitais(filtro: HospitalFiltro, paginacao: Paginacao): HospitalConnection!
  
  # Cirurgias
  cirurgia(id: ID!): Cirurgia
  cirurgias(filtro: CirurgiaFiltro, paginacao: Paginacao): CirurgiaConnection!
  cirurgiasAgendadas(
    dataInicio: DateTime!
    dataFim: DateTime!
    medicoId: ID
    hospitalId: ID
  ): [Cirurgia!]!
  
  # Estoque e OPME
  produtoOPME(id: ID, codigoInterno: String, codigoANVISA: String): ProdutoOPME
  produtosOPME(filtro: ProdutoFiltro, paginacao: Paginacao): ProdutoConnection!
  estoqueAtual(produtoId: ID!): EstoqueInfo!
  alertasEstoque(nivel: NivelAlerta): [AlertaEstoque!]!
  
  # Compras
  cotacao(id: ID!): Cotacao
  cotacoes(filtro: CotacaoFiltro, paginacao: Paginacao): CotacaoConnection!
  
  pedidoCompra(id: ID!): PedidoCompra
  pedidosCompra(filtro: PedidoFiltro, paginacao: Paginacao): PedidoConnection!
  
  # Financeiro
  faturamento(mes: Int!, ano: Int!): FaturamentoMensal!
  contasReceber(filtro: ContasFiltro, paginacao: Paginacao): ContasConnection!
  contasPagar(filtro: ContasFiltro, paginacao: Paginacao): ContasConnection!
  
  # Analytics e Relatórios
  dashboardPrincipal: DashboardData!
  dashboardModulo(modulo: String!): ModuloDashboardData!
  relatorio(tipo: TipoRelatorio!, parametros: JSON!): RelatorioResult!
  
  # Busca Universal
  buscarGlobal(termo: String!, tipos: [TipoBusca!], limite: Int): [ResultadoBusca!]!
}

# =========================================
# MUTATIONS
# =========================================

type Mutation {
  # Autenticação
  login(email: String!, senha: String!): AuthPayload!
  logout: Boolean!
  refreshToken(refreshToken: String!): AuthPayload!
  
  # Cadastros
  criarMedico(dados: MedicoInput!): Medico!
  atualizarMedico(id: ID!, dados: MedicoInput!): Medico!
  excluirMedico(id: ID!): Boolean!
  
  criarHospital(dados: HospitalInput!): Hospital!
  atualizarHospital(id: ID!, dados: HospitalInput!): Hospital!
  
  criarPaciente(dados: PacienteInput!): Paciente!
  atualizarPaciente(id: ID!, dados: PacienteInput!): Paciente!
  
  # Cirurgias
  agendarCirurgia(dados: CirurgiaInput!): Cirurgia!
  atualizarCirurgia(id: ID!, dados: CirurgiaInput!): Cirurgia!
  cancelarCirurgia(id: ID!, motivo: String!): Cirurgia!
  confirmarCirurgia(id: ID!): Cirurgia!
  iniciarCirurgia(id: ID!): Cirurgia!
  concluirCirurgia(id: ID!, relatorio: RelatorioCirurgiaInput!): Cirurgia!
  
  # Estoque e OPME
  cadastrarProdutoOPME(dados: ProdutoOPMEInput!): ProdutoOPME!
  movimentarEstoque(movimento: MovimentoEstoqueInput!): MovimentoEstoque!
  registrarRastreabilidade(dados: RastreabilidadeInput!): RastreabilidadeItem!
  
  # Compras
  criarCotacao(dados: CotacaoInput!): Cotacao!
  adicionarFornecedorCotacao(cotacaoId: ID!, fornecedorId: ID!): Cotacao!
  aprovarCotacao(id: ID!, fornecedorSelecionado: ID!): PedidoCompra!
  
  criarPedidoCompra(dados: PedidoCompraInput!): PedidoCompra!
  aprovarPedido(id: ID!, aprovadorId: ID!, comentario: String): PedidoCompra!
  receberPedido(id: ID!, itensRecebidos: [ItemRecebidoInput!]!): PedidoCompra!
  
  # NF-e
  processarNFe(xmlNFe: String!): NotaFiscal!
  validarNFeSEFAZ(chaveAcesso: String!): ValidacaoSEFAZ!
  
  # Financeiro
  gerarFatura(cirurgiaId: ID!): Fatura!
  registrarPagamento(faturaId: ID!, pagamento: PagamentoInput!): Fatura!
  
  # Sistema
  uploadArquivo(arquivo: Upload!, tipo: TipoArquivo!): Arquivo!
  exportarDados(tipo: TipoExportacao!, filtros: JSON!): ExportJob!
}

# =========================================
# SUBSCRIPTIONS (Real-time)
# =========================================

type Subscription {
  # Notificações em tempo real
  notificacao(usuarioId: ID!): Notificacao!
  
  # Atualizações de estoque
  estoqueAtualizado(produtoId: ID): EstoqueInfo!
  alertaEstoque: AlertaEstoque!
  
  # Status de cirurgias
  cirurgiaAtualizada(cirurgiaId: ID): Cirurgia!
  
  # Aprovações pendentes
  aprovacaoPendente(usuarioId: ID!): AprovacaoPendente!
  
  # Jobs assíncronos
  jobStatus(jobId: ID!): JobStatus!
}

# =========================================
# INPUT TYPES
# =========================================

input MedicoInput {
  nome: String!
  cpf: String!
  crm: String!
  ufCRM: String!
  especialidades: [String!]!
  telefone: String
  celular: String!
  email: String!
  endereco: EnderecoInput!
  dadosBancarios: DadosBancariosInput
  documentos: [DocumentoInput!]
}

input CirurgiaInput {
  pacienteId: ID!
  medicoId: ID!
  hospitalId: ID!
  dataAgendamento: DateTime!
  procedimento: String!
  procedimentoTUSS: String
  equipeMedicaId: ID
  materiaisOPMEIds: [ID!]
  observacoes: String
}

input ProdutoOPMEInput {
  descricao: String!
  codigoANVISA: String!
  codigoTUSS: String
  fornecedorId: ID!
  categoriaId: ID!
  precoCompra: Float!
  precoVenda: Float!
  minimoEstoque: Int!
  maximoEstoque: Int!
  exigeRastreabilidade: Boolean!
}

# =========================================
# PAGINATION & FILTERING
# =========================================

input Paginacao {
  pagina: Int = 1
  porPagina: Int = 20
  ordenarPor: String
  direcao: DirecaoOrdenacao = ASC
}

enum DirecaoOrdenacao {
  ASC
  DESC
}

type PageInfo {
  temProxima: Boolean!
  temAnterior: Boolean!
  paginaAtual: Int!
  totalPaginas: Int!
  totalItens: Int!
}

type MedicoConnection {
  edges: [MedicoEdge!]!
  pageInfo: PageInfo!
}

type MedicoEdge {
  node: Medico!
  cursor: String!
}
```

#### Implementação Backend (Node.js + Apollo Server)

```typescript
// server/graphql/schema.ts
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// server/graphql/resolvers/index.ts
import { GraphQLDateTime, GraphQLJSON, GraphQLUpload } from 'graphql-scalars';
import medicosResolvers from './medicos';
import cirurgiasResolvers from './cirurgias';
import comprasResolvers from './compras';
import estoqueResolvers from './estoque';
import financeiroResolvers from './financeiro';

export default {
  // Custom Scalars
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
  Upload: GraphQLUpload,
  
  // Queries
  Query: {
    ...medicosResolvers.Query,
    ...cirurgiasResolvers.Query,
    ...comprasResolvers.Query,
    ...estoqueResolvers.Query,
    ...financeiroResolvers.Query,
  },
  
  // Mutations
  Mutation: {
    ...medicosResolvers.Mutation,
    ...cirurgiasResolvers.Mutation,
    ...comprasResolvers.Mutation,
    ...estoqueResolvers.Mutation,
    ...financeiroResolvers.Mutation,
  },
  
  // Subscriptions
  Subscription: {
    ...estoqueResolvers.Subscription,
    ...cirurgiasResolvers.Subscription,
  },
  
  // Type Resolvers (Nested fields)
  Medico: medicosResolvers.Medico,
  Cirurgia: cirurgiasResolvers.Cirurgia,
  ProdutoOPME: estoqueResolvers.ProdutoOPME,
};

// server/graphql/resolvers/medicos.ts
export default {
  Query: {
    medico: async (_, { id, crm }, context) => {
      // Verificar autenticação
      if (!context.user) {
        throw new Error('Não autenticado');
      }
      
      // Verificar permissão
      if (!context.user.permissoes.includes('ler_medicos')) {
        throw new Error('Sem permissão para acessar dados de médicos');
      }
      
      // Buscar médico
      if (id) {
        return await MedicosService.findById(id);
      }
      if (crm) {
        return await MedicosService.findByCRM(crm);
      }
      
      throw new Error('Informe id ou crm');
    },
    
    medicos: async (_, { filtro, paginacao }, context) => {
      if (!context.user?.permissoes.includes('ler_medicos')) {
        throw new Error('Sem permissão');
      }
      
      const result = await MedicosService.list({
        ...filtro,
        ...paginacao,
      });
      
      return {
        edges: result.data.map(medico => ({
          node: medico,
          cursor: Buffer.from(medico.id).toString('base64'),
        })),
        pageInfo: {
          temProxima: result.page < result.totalPages,
          temAnterior: result.page > 1,
          paginaAtual: result.page,
          totalPaginas: result.totalPages,
          totalItens: result.total,
        },
      };
    },
  },
  
  Mutation: {
    criarMedico: async (_, { dados }, context) => {
      if (!context.user?.permissoes.includes('criar_medicos')) {
        throw new Error('Sem permissão');
      }
      
      // Validar CPF
      const cpfValido = await ValidacaoService.validarCPF(dados.cpf);
      if (!cpfValido) {
        throw new Error('CPF inválido');
      }
      
      // Validar CRM via CFM
      const crmValido = await ValidacaoService.validarCRM(dados.crm, dados.ufCRM);
      if (!crmValido) {
        throw new Error('CRM não encontrado no CFM');
      }
      
      // Verificar duplicatas
      const duplicatas = await DuplicateDetectionService.check('medico', dados);
      if (duplicatas.length > 0) {
        throw new Error(`Possível duplicata encontrada: ${duplicatas[0].match}`);
      }
      
      // Criar médico
      const medico = await MedicosService.create({
        ...dados,
        criadoPor: context.user.id,
      });
      
      // Log de auditoria
      await AuditService.log({
        usuario: context.user.id,
        acao: 'CRIAR_MEDICO',
        entidade: 'medico',
        entidadeId: medico.id,
        dados: dados,
      });
      
      return medico;
    },
  },
  
  // Nested field resolvers
  Medico: {
    hospitais: async (medico, _, context) => {
      return await HospitaisService.findByMedicoId(medico.id);
    },
    
    equipes: async (medico, _, context) => {
      return await EquipesService.findByMedicoId(medico.id);
    },
    
    cirurgiasAgendadas: async (medico, _, context) => {
      return await CirurgiasService.findByMedicoId(medico.id, {
        status: ['AGENDADA', 'CONFIRMADA'],
      });
    },
  },
};
```

#### Cliente Frontend (React + Apollo Client)

```typescript
// src/hooks/useGraphQL.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
    connectionParams: () => ({
      authToken: localStorage.getItem('auth_token'),
    }),
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          medicos: {
            keyArgs: ['filtro'],
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

// src/graphql/queries/medicos.ts
import { gql } from '@apollo/client';

export const GET_MEDICO = gql`
  query GetMedico($id: ID!) {
    medico(id: $id) {
      id
      nome
      crm
      ufCRM
      especialidades
      telefone
      celular
      email
      hospitais {
        id
        razaoSocial
      }
      cirurgiasAgendadas {
        id
        dataAgendamento
        procedimento
        hospital {
          razaoSocial
        }
      }
    }
  }
`;

export const LIST_MEDICOS = gql`
  query ListMedicos($filtro: MedicoFiltro, $paginacao: Paginacao) {
    medicos(filtro: $filtro, paginacao: $paginacao) {
      edges {
        node {
          id
          nome
          crm
          especialidades
          telefone
          email
        }
      }
      pageInfo {
        temProxima
        temAnterior
        paginaAtual
        totalPaginas
        totalItens
      }
    }
  }
`;

export const CREATE_MEDICO = gql`
  mutation CreateMedico($dados: MedicoInput!) {
    criarMedico(dados: $dados) {
      id
      nome
      crm
      email
    }
  }
`;

// src/pages/cadastros/CadastroMedicos.tsx (uso)
import { useQuery, useMutation } from '@apollo/client';
import { LIST_MEDICOS, CREATE_MEDICO } from '@/graphql/queries/medicos';

export const CadastroMedicos = () => {
  // Query
  const { data, loading, error } = useQuery(LIST_MEDICOS, {
    variables: {
      filtro: { ativo: true },
      paginacao: { pagina: 1, porPagina: 20 },
    },
  });
  
  // Mutation
  const [criarMedico, { loading: creating }] = useMutation(CREATE_MEDICO, {
    onCompleted: (data) => {
      toast.success(`Médico ${data.criarMedico.nome} cadastrado com sucesso!`);
    },
    refetchQueries: [{ query: LIST_MEDICOS }],
  });
  
  const handleSubmit = async (formData) => {
    await criarMedico({
      variables: { dados: formData },
    });
  };
  
  // Subscription para notificações em tempo real
  useSubscription(NOTIFICACAO_SUBSCRIPTION, {
    variables: { usuarioId: currentUser.id },
    onData: ({ data }) => {
      toast.info(data.notificacao.mensagem);
    },
  });
  
  // ... resto do componente
};
```

---

### 2. APIs RESTful Internas (Microsserviços)

**Quando usar REST ao invés de GraphQL?**
- ✅ Comunicação máquina-a-máquina (sem overhead de parsing GraphQL)
- ✅ Operações CRUD simples
- ✅ Integração com sistemas legados
- ✅ Webhooks de terceiros

#### Estrutura de Endpoints

```
BASE URL: https://api.icarus.health/v1

╔════════════════════════════════════════════════════════════
║ AUTENTICAÇÃO & USUÁRIOS
╚════════════════════════════════════════════════════════════
POST   /auth/login                  # Login
POST   /auth/logout                 # Logout
POST   /auth/refresh                # Refresh token
GET    /auth/me                     # Usuário autenticado

GET    /usuarios                    # Listar usuários
GET    /usuarios/:id                # Buscar usuário
POST   /usuarios                    # Criar usuário
PATCH  /usuarios/:id                # Atualizar usuário
DELETE /usuarios/:id                # Excluir usuário

╔════════════════════════════════════════════════════════════
║ CADASTROS
╚════════════════════════════════════════════════════════════
GET    /medicos                     # Listar médicos
GET    /medicos/:id                 # Buscar médico
GET    /medicos/crm/:crm            # Buscar por CRM
POST   /medicos                     # Criar médico
PATCH  /medicos/:id                 # Atualizar médico
DELETE /medicos/:id                 # Excluir médico
POST   /medicos/:id/validar-crm     # Validar CRM no CFM

GET    /hospitais                   # Listar hospitais
GET    /hospitais/:id               # Buscar hospital
POST   /hospitais                   # Criar hospital
POST   /hospitais/:id/validar-cnes  # Validar CNES

GET    /pacientes                   # Listar pacientes
GET    /pacientes/:id               # Buscar paciente
POST   /pacientes                   # Criar paciente
GET    /pacientes/:id/historico     # Histórico médico

╔═════════════════════════���══════════════════════════════════
║ CIRURGIAS
╚════════════════════════════════════════════════════════════
GET    /cirurgias                   # Listar cirurgias
GET    /cirurgias/:id               # Buscar cirurgia
POST   /cirurgias                   # Agendar cirurgia
PATCH  /cirurgias/:id               # Atualizar cirurgia
POST   /cirurgias/:id/confirmar     # Confirmar cirurgia
POST   /cirurgias/:id/iniciar       # Iniciar cirurgia
POST   /cirurgias/:id/concluir      # Concluir cirurgia
DELETE /cirurgias/:id/cancelar      # Cancelar cirurgia

╔════════════════════════════════════════════════════════════
║ ESTOQUE & OPME
╚════════════════════════════════════════════════════════════
GET    /produtos-opme               # Listar produtos
GET    /produtos-opme/:id           # Buscar produto
POST   /produtos-opme               # Cadastrar produto
POST   /produtos-opme/:id/validar-anvisa  # Validar ANVISA

GET    /estoque                     # Consultar estoque
POST   /estoque/movimentacao        # Movimentar estoque
GET    /estoque/alertas             # Alertas de estoque
GET    /estoque/rastreabilidade/:lote  # Rastreabilidade

╔════════════════════════════════════════════════════════════
║ COMPRAS
╚════════════════════════════════════════════════════════════
GET    /cotacoes                    # Listar cotações
POST   /cotacoes                    # Criar cotação
POST   /cotacoes/:id/enviar         # Enviar para fornecedores
POST   /cotacoes/:id/aprovar        # Aprovar cotação

GET    /pedidos-compra              # Listar pedidos
POST   /pedidos-compra              # Criar pedido
POST   /pedidos-compra/:id/aprovar  # Aprovar pedido
POST   /pedidos-compra/:id/receber  # Receber pedido

POST   /nfe/processar               # Processar XML NF-e
POST   /nfe/validar-sefaz           # Validar no SEFAZ

╔════════════════════════════════════════════════════════════
║ FINANCEIRO
╚════════════════════════════════════════════════════════════
GET    /faturas                     # Listar faturas
POST   /faturas                     # Gerar fatura
POST   /faturas/:id/pagamento       # Registrar pagamento

GET    /contas-receber              # Contas a receber
GET    /contas-pagar                # Contas a pagar

╔════════════════════════════════════════════════════════════
║ RELATÓRIOS & ANALYTICS
╚════════════════════════════════════════════════════════════
GET    /relatorios/:tipo            # Gerar relatório
GET    /dashboards/:modulo          # Dashboard do módulo
GET    /analytics/kpis              # KPIs do sistema

╔════════════════════════════════════════════════════════════
║ SISTEMA
╚════════════════════════════════════════════════════════════
POST   /uploads                     # Upload de arquivos
GET    /health                      # Health check
GET    /version                     # Versão da API
```

#### Implementação (Node.js + Express + Supabase)

```typescript
// server/routes/medicos.ts
import { Router } from 'express';
import { authenticateJWT, requirePermission } from '@/middleware/auth';
import { MedicosController } from '@/controllers/medicos';
import { validateRequest } from '@/middleware/validation';
import { medicoSchema } from '@/schemas/medico';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateJWT);

// GET /medicos - Listar médicos
router.get(
  '/',
  requirePermission('ler_medicos'),
  MedicosController.list
);

// GET /medicos/:id - Buscar médico
router.get(
  '/:id',
  requirePermission('ler_medicos'),
  MedicosController.findById
);

// GET /medicos/crm/:crm - Buscar por CRM
router.get(
  '/crm/:crm',
  requirePermission('ler_medicos'),
  MedicosController.findByCRM
);

// POST /medicos - Criar médico
router.post(
  '/',
  requirePermission('criar_medicos'),
  validateRequest(medicoSchema),
  MedicosController.create
);

// PATCH /medicos/:id - Atualizar médico
router.patch(
  '/:id',
  requirePermission('editar_medicos'),
  validateRequest(medicoSchema.partial()),
  MedicosController.update
);

// DELETE /medicos/:id - Excluir médico (soft delete)
router.delete(
  '/:id',
  requirePermission('excluir_medicos'),
  MedicosController.delete
);

// POST /medicos/:id/validar-crm - Validar CRM no CFM
router.post(
  '/:id/validar-crm',
  requirePermission('validar_cadastros'),
  MedicosController.validarCRM
);

export default router;

// server/controllers/medicos.ts
import { Request, Response } from 'express';
import { MedicosService } from '@/services/cadastros';
import { ValidacaoService } from '@/services/validacao';
import { DuplicateDetectionService } from '@/services/duplicateDetection';
import { AuditService } from '@/services/audit';

export class MedicosController {
  static async list(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, filtro, ordenar } = req.query;
      
      const result = await MedicosService.list({
        page: Number(page),
        limit: Number(limit),
        filtro: filtro ? JSON.parse(filtro as string) : {},
        ordenar: ordenar as string,
      });
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  
  static async create(req: Request, res: Response) {
    try {
      const dados = req.body;
      const userId = req.user.id;
      
      // 1. Validar CPF
      const cpfValido = await ValidacaoService.validarCPF(dados.cpf);
      if (!cpfValido.valid) {
        return res.status(400).json({
          success: false,
          error: 'CPF inválido',
          details: cpfValido.error,
        });
      }
      
      // 2. Validar CRM via CFM
      const crmValido = await ValidacaoService.validarCRM(
        dados.crm,
        dados.ufCRM
      );
      if (!crmValido.valid) {
        return res.status(400).json({
          success: false,
          error: 'CRM não encontrado no Conselho Federal de Medicina',
          details: crmValido.error,
        });
      }
      
      // 3. Detectar duplicatas
      const duplicatas = await DuplicateDetectionService.check('medico', dados);
      if (duplicatas.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Possível duplicata encontrada',
          duplicatas: duplicatas.map(d => ({
            id: d.id,
            nome: d.match,
            score: d.score,
          })),
        });
      }
      
      // 4. Criar médico
      const medico = await MedicosService.create({
        ...dados,
        criado_por: userId,
      });
      
      // 5. Audit log
      await AuditService.log({
        usuario_id: userId,
        acao: 'CREATE',
        entidade: 'medico',
        entidade_id: medico.id,
        dados_anteriores: null,
        dados_novos: medico,
        ip: req.ip,
        user_agent: req.get('User-Agent'),
      });
      
      res.status(201).json({
        success: true,
        data: medico,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  
  static async validarCRM(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const medico = await MedicosService.findById(id);
      if (!medico) {
        return res.status(404).json({
          success: false,
          error: 'Médico não encontrado',
        });
      }
      
      const validacao = await ValidacaoService.validarCRM(
        medico.crm,
        medico.uf_crm
      );
      
      if (validacao.valid) {
        // Atualizar flag de CRM validado
        await MedicosService.update(id, {
          crm_validado: true,
          crm_validado_em: new Date(),
        });
      }
      
      res.json({
        success: true,
        data: validacao,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
```

---

## 🔒 SEGURANÇA DA API

### 1. Autenticação: JWT + OAuth 2.0

```typescript
// server/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

interface JWTPayload {
  userId: string;
  email: string;
  permissoes: string[];
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extrair token do header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
    }
    
    const token = authHeader.substring(7);
    
    // 2. Verificar e decodificar token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // 3. Buscar usuário atualizado no banco
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*, perfil_permissoes(permissoes(*))')
      .eq('id', decoded.userId)
      .eq('ativo', true)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo',
      });
    }
    
    // 4. Anexar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      cargo: user.cargo,
      departamento: user.departamento,
      permissoes: user.perfil_permissoes.flatMap(pp => pp.permissoes.codigo),
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};

export const requirePermission = (...permissoes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
      });
    }
    
    const hasPermission = permissoes.some(p =>
      req.user.permissoes.includes(p)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para acessar este recurso',
        permissoesNecessarias: permissoes,
      });
    }
    
    next();
  };
};

// Geração de tokens
export const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      permissoes: user.permissoes,
    },
    JWT_SECRET,
    { expiresIn: '15m' } // Token de acesso expira em 15 minutos
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token expira em 7 dias
  );
  
  return { accessToken, refreshToken };
};
```

### 2. Controle de Acesso (RBAC)

```typescript
// server/services/rbac.ts
export class RBACService {
  private static permissionHierarchy = {
    // Hierarquia de permissões (herança)
    'admin': ['*'], // Admin tem todas as permissões
    'gestor_compras': [
      'ler_cotacoes',
      'criar_cotacoes',
      'editar_cotacoes',
      'aprovar_cotacoes',
      'ler_pedidos',
      'criar_pedidos',
      'aprovar_pedidos',
      'ler_fornecedores',
    ],
    'comprador': [
      'ler_cotacoes',
      'criar_cotacoes',
      'ler_pedidos',
      'criar_pedidos',
      'ler_fornecedores',
    ],
    'estoquista': [
      'ler_estoque',
      'movimentar_estoque',
      'ler_produtos',
    ],
  };
  
  static async checkPermission(
    userId: string,
    permission: string
  ): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId);
    
    // Admin tem todas as permissões
    if (user.perfil === 'admin') return true;
    
    // Verificar permissões diretas
    if (user.permissoes.includes(permission)) return true;
    
    // Verificar permissões herdadas
    const inheritedPermissions = this.permissionHierarchy[user.perfil] || [];
    if (inheritedPermissions.includes('*')) return true;
    if (inheritedPermissions.includes(permission)) return true;
    
    return false;
  }
  
  static async checkMultiplePermissions(
    userId: string,
    permissions: string[],
    requireAll = false
  ): Promise<boolean> {
    const checks = await Promise.all(
      permissions.map(p => this.checkPermission(userId, p))
    );
    
    return requireAll
      ? checks.every(Boolean)
      : checks.some(Boolean);
  }
}
```

### 3. Rate Limiting

```typescript
// server/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Rate limiter global
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por 15 minutos
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
});

// Rate limiter para autenticação (mais restritivo)
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Apenas 5 tentativas de login em 15 minutos
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Muitas tentativas de login. Aguarde 15 minutos.',
  },
});

// Rate limiter para APIs pesadas
export const heavyLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:heavy:',
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requests por minuto
  message: {
    success: false,
    error: 'Limite excedido para esta operação.',
  },
});

// Uso nas rotas
app.use('/api/v1', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/relatorios', heavyLimiter);
```

---

## 🌐 INTEGRAÇÕES EXTERNAS

### Tabela de Integrações

| **Serviço** | **Fornecedor** | **Propósito** | **Implementado** | **Custo Mensal** |
|------------|---------------|--------------|-----------------|-----------------|
| **APIs Governamentais** |||
| NF-e / SEFAZ | SEFAZ Nacional | Validação de notas fiscais eletrônicas | ✅ | Gratuito |
| ANVISA | ANVISA DataVisa | Validação códigos ANVISA, rastreabilidade OPME | ✅ | Gratuito |
| CFM | CFM (scraping) | Validação CRM de médicos | ✅ | Gratuito |
| Receita Federal | Brasil API | Consulta CNPJ/CPF | ✅ | Gratuito |
| ViaCEP | ViaCEP | Consulta CEP | ✅ | Gratuito |
| **Pagamentos & Financeiro** |||
| Pagamentos Online | **Stripe** | Pagamentos PIX, cartão, boleto (internacional) | ⏳ | 3,99% + R$0,39 |
| Conciliação Bancária | **Pluggy** | Open Banking brasileiro (agregador bancário) | ⏳ | ~R$200/mês |
| **Comunicação** |||
| SMS / WhatsApp | **Z-API** | WhatsApp Business API + Automação (BR) | ⏳ | ~R$149/mês |
| E-mail Transacional | **Resend** | Emails de notificação (alternativa Twilio SendGrid) | ⏳ | $20/mês (~R$100) |
| **Geolocalização** |||
| Mapas & Rotas | **Google Maps API** | Geolocalização, rotas, distâncias | ⏳ | ~$50/mês |
| **CRM & Marketing** |||
| CRM | **RD Station** | CRM brasileiro, automação marketing | ⏳ Opcional | ~R$500/mês |
| **Analytics & Monitoramento** |||
| Analytics | **PostHog CE** (OSS) | Product analytics, session replay | ✅ | $0 (self-hosted) |
| Error Tracking | **GlitchTip** (OSS) | Monitoramento de erros | ✅ | $0 (self-hosted) |
| **Armazenamento** |||
| Object Storage | **Supabase Storage** | Armazenamento de arquivos, imagens, PDFs | ✅ | Incluído no plano |
| **Busca** |||
| Search Engine | **Meilisearch** (OSS) | Busca full-text ultrarrápida | ✅ | $0 (self-hosted) |
| **IA & Machine Learning** |||
| LLM Médica | **Ollama + Meditron** | Justificativas OPME, análise médica | ✅ | $0 (local) |
| LLM Jurídica | **Ollama + SAUL-7B** | Análise contratos, compliance legal | ✅ | $0 (local) |
| LLM Base | **Ollama + Llama 3.1 8B** | Chatbot, assistência geral | ✅ | $0 (local) |
| Visão Computacional | **GPT-4o Mini** (fallback) | Análise de imagens OPME | ⏳ | ~$5/mês |

**Total Estimado**: ~R$1.100-1.700/mês (vs R$5.000-8.000 com soluções americanas)

**Economia Anual**: R$39.600-76.800 comparado a soluções americanas tradicionais

---

### Implementação de Integrações

#### 1. SEFAZ (Validação NF-e)

```typescript
// server/services/integrations/sefaz.ts
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export class SEFAZService {
  private static readonly SEFAZ_URLS = {
    SP: 'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
    RJ: 'https://nfe.fazenda.rj.gov.br/ws/nfestatusservico4.asmx',
    // ... outros estados
  };
  
  static async validarNFe(chaveAcesso: string, uf: string) {
    try {
      const url = this.SEFAZ_URLs[uf];
      if (!url) {
        throw new Error(`UF ${uf} não suportada`);
      }
      
      const soapEnvelope = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
          <soap:Body>
            <nfeConsultaNF xmlns="http://www.portalfiscal.inf.br/nfe">
              <chNFe>${chaveAcesso}</chNFe>
            </nfeConsultaNF>
          </soap:Body>
        </soap:Envelope>
      `;
      
      const response = await axios.post(url, soapEnvelope, {
        headers: { 'Content-Type': 'application/soap+xml' },
        timeout: 30000,
      });
      
      const result = await parseStringPromise(response.data);
      const retorno = result['soap:Envelope']['soap:Body'][0]['nfeConsultaNFResult'][0];
      
      return {
        valid: retorno.cStat[0] === '100', // 100 = Autorizada
        status: retorno.cStat[0],
        mensagem: retorno.xMotivo[0],
        protocolo: retorno.nProt?.[0],
        dataAutorizacao: retorno.dhRecbto?.[0],
      };
    } catch (error) {
      console.error('Erro ao validar NF-e no SEFAZ:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }
  
  static async processarXMLNFe(xmlContent: string) {
    try {
      const parsed = await parseStringPromise(xmlContent);
      const nfe = parsed.nfeProc?.NFe?.[0]?.infNFe?.[0];
      
      if (!nfe) {
        throw new Error('XML NF-e inválido');
      }
      
      return {
        chaveAcesso: nfe.$.Id.replace('NFe', ''),
        numero: nfe.ide[0].nNF[0],
        serie: nfe.ide[0].serie[0],
        dataEmissao: nfe.ide[0].dhEmi[0],
        fornecedor: {
          cnpj: nfe.emit[0].CNPJ[0],
          razaoSocial: nfe.emit[0].xNome[0],
        },
        itens: nfe.det.map((item: any) => ({
          codigo: item.prod[0].cProd[0],
          descricao: item.prod[0].xProd[0],
          quantidade: parseFloat(item.prod[0].qCom[0]),
          valorUnitario: parseFloat(item.prod[0].vUnCom[0]),
          valorTotal: parseFloat(item.prod[0].vProd[0]),
        })),
        valorTotal: parseFloat(nfe.total[0].ICMSTot[0].vNF[0]),
      };
    } catch (error) {
      throw new Error(`Erro ao processar XML NF-e: ${error.message}`);
    }
  }
}
```

#### 2. ANVISA (Validação Códigos)

```typescript
// server/services/integrations/anvisa.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export class ANVISAService {
  private static readonly BASE_URL = 'https://consultas.anvisa.gov.br';
  
  static async validarCodigoANVISA(codigo: string) {
    try {
      // Scraping do site da ANVISA (não há API pública)
      const response = await axios.get(
        `${this.BASE_URL}/#/medicamentos/q/?numeroRegistro=${codigo}`,
        { timeout: 15000 }
      );
      
      const $ = cheerio.load(response.data);
      
      const encontrado = $('.resultado-busca').length > 0;
      if (!encontrado) {
        return {
          valid: false,
          mensagem: 'Código ANVISA não encontrado',
        };
      }
      
      const produto = {
        codigo: codigo,
        nome: $('.nome-produto').first().text().trim(),
        fabricante: $('.fabricante').first().text().trim(),
        situacao: $('.situacao').first().text().trim(),
      };
      
      return {
        valid: true,
        produto,
      };
    } catch (error) {
      console.error('Erro ao validar código ANVISA:', error);
      return {
        valid: false,
        error: 'Erro ao consultar ANVISA',
      };
    }
  }
}
```

#### 3. Stripe (Pagamentos)

```typescript
// server/services/integrations/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Criar Payment Intent (PIX, Cartão, Boleto)
  static async criarPagamento(dados: {
    valor: number;
    descricao: string;
    metodosPagamento: string[]; // ['card', 'boleto', 'pix']
    metadados?: Record<string, string>;
  }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(dados.valor * 100), // Converter para centavos
        currency: 'brl',
        payment_method_types: dados.metodosPagamento,
        description: dados.descricao,
        metadata: {
          ...dados.metadados,
          sistema: 'ICARUS v5.0',
        },
      });
      
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      };
    } catch (error) {
      throw new Error(`Erro ao criar pagamento: ${error.message}`);
    }
  }
  
  // Criar link de checkout hospedado
  static async criarCheckoutSession(dados: {
    itens: Array<{ nome: string; valor: number; quantidade: number }>;
    referenciaExterna: string;
    emailCliente?: string;
  }) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'boleto'],
        line_items: dados.itens.map(item => ({
          price_data: {
            currency: 'brl',
            product_data: {
              name: item.nome,
            },
            unit_amount: Math.round(item.valor * 100),
          },
          quantity: item.quantidade,
        })),
        mode: 'payment',
        success_url: `${process.env.APP_URL}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/pagamento/cancelado`,
        metadata: {
          referencia_externa: dados.referenciaExterna,
        },
        customer_email: dados.emailCliente,
      });
      
      return {
        id: session.id,
        url: session.url, // URL para redirecionar o cliente
      };
    } catch (error) {
      throw new Error(`Erro ao criar checkout: ${error.message}`);
    }
  }
  
  // Webhook de notificação
  static async processarWebhook(
    body: string | Buffer,
    signature: string
  ) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await this.handlePagamentoAprovado(paymentIntent);
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          await this.handlePagamentoFalhou(failedPayment);
          break;
          
        case 'charge.refunded':
          const refund = event.data.object;
          await this.handleReembolso(refund);
          break;
          
        default:
          console.log(`Evento não tratado: ${event.type}`);
      }
      
      return { received: true };
    } catch (error) {
      throw new Error(`Erro ao processar webhook: ${error.message}`);
    }
  }
  
  private static async handlePagamentoAprovado(payment: any) {
    await supabase
      .from('pagamentos')
      .update({
        status: 'aprovado',
        stripe_payment_id: payment.id,
        aprovado_em: new Date(),
      })
      .eq('id', payment.metadata.pagamento_id);
      
    // Disparar evento para módulo financeiro
    await EventEmitter.emit('pagamento:aprovado', {
      pagamentoId: payment.metadata.pagamento_id,
      valor: payment.amount / 100,
    });
  }
  
  private static async handlePagamentoFalhou(payment: any) {
    await supabase
      .from('pagamentos')
      .update({
        status: 'falhou',
        erro: payment.last_payment_error?.message,
      })
      .eq('id', payment.metadata.pagamento_id);
  }
  
  private static async handleReembolso(refund: any) {
    await supabase
      .from('pagamentos')
      .update({
        status: 'reembolsado',
        reembolsado_em: new Date(),
        valor_reembolsado: refund.amount / 100,
      })
      .eq('stripe_payment_id', refund.payment_intent);
  }
  
  // Consultar pagamento
  static async consultarPagamento(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        valor: paymentIntent.amount / 100,
        metodoPagamento: paymentIntent.payment_method_types[0],
        criadoEm: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      throw new Error(`Erro ao consultar pagamento: ${error.message}`);
    }
  }
  
  // Criar reembolso
  static async criarReembolso(paymentIntentId: string, valor?: number) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: valor ? Math.round(valor * 100) : undefined, // Reembolso parcial ou total
      });
      
      return {
        id: refund.id,
        status: refund.status,
        valor: refund.amount / 100,
      };
    } catch (error) {
      throw new Error(`Erro ao criar reembolso: ${error.message}`);
    }
  }
}
```

#### 4. Z-API (WhatsApp + SMS)

```typescript
// server/services/integrations/zapi.ts
import axios from 'axios';

export class ZAPIService {
  private static readonly BASE_URL = process.env.ZAPI_BASE_URL!;
  private static readonly INSTANCE_ID = process.env.ZAPI_INSTANCE_ID!;
  private static readonly TOKEN = process.env.ZAPI_TOKEN!;
  
  private static get headers() {
    return {
      'Client-Token': this.TOKEN,
      'Content-Type': 'application/json',
    };
  }
  
  // Enviar mensagem de texto
  static async enviarMensagem(dados: {
    telefone: string; // Formato: 5511999999999
    mensagem: string;
  }) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/send-text`,
        {
          phone: dados.telefone,
          message: dados.mensagem,
        },
        { headers: this.headers }
      );
      
      return {
        sucesso: true,
        messageId: response.data.messageId,
      };
    } catch (error) {
      throw new Error(`Erro ao enviar mensagem: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Enviar mensagem com template (mais rápido, aprovado pelo WhatsApp)
  static async enviarTemplate(dados: {
    telefone: string;
    templateId: string;
    variaveis?: string[];
  }) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/send-template`,
        {
          phone: dados.telefone,
          template: {
            id: dados.templateId,
            variables: dados.variaveis,
          },
        },
        { headers: this.headers }
      );
      
      return {
        sucesso: true,
        messageId: response.data.messageId,
      };
    } catch (error) {
      throw new Error(`Erro ao enviar template: ${error.message}`);
    }
  }
  
  // Enviar arquivo (PDF, imagem, etc)
  static async enviarArquivo(dados: {
    telefone: string;
    urlArquivo: string;
    tipo: 'image' | 'document' | 'audio' | 'video';
    legenda?: string;
  }) {
    try {
      const endpoint = {
        image: '/send-image',
        document: '/send-document',
        audio: '/send-audio',
        video: '/send-video',
      }[dados.tipo];
      
      const response = await axios.post(
        `${this.BASE_URL}${endpoint}`,
        {
          phone: dados.telefone,
          [dados.tipo]: dados.urlArquivo,
          caption: dados.legenda,
        },
        { headers: this.headers }
      );
      
      return {
        sucesso: true,
        messageId: response.data.messageId,
      };
    } catch (error) {
      throw new Error(`Erro ao enviar arquivo: ${error.message}`);
    }
  }
  
  // Enviar mensagem em lote (até 100 por vez)
  static async enviarEmLote(mensagens: Array<{
    telefone: string;
    mensagem: string;
  }>) {
    try {
      const promises = mensagens.map(msg =>
        this.enviarMensagem(msg).catch(error => ({
          sucesso: false,
          telefone: msg.telefone,
          erro: error.message,
        }))
      );
      
      const resultados = await Promise.all(promises);
      
      return {
        total: mensagens.length,
        enviados: resultados.filter((r: any) => r.sucesso).length,
        falhas: resultados.filter((r: any) => !r.sucesso),
      };
    } catch (error) {
      throw new Error(`Erro ao enviar em lote: ${error.message}`);
    }
  }
  
  // Verificar se número tem WhatsApp
  static async verificarNumero(telefone: string) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/phone-exists/${telefone}`,
        { headers: this.headers }
      );
      
      return {
        existe: response.data.exists,
        telefone: response.data.phone,
      };
    } catch (error) {
      return { existe: false, telefone };
    }
  }
  
  // Webhook handler para mensagens recebidas
  static async handleWebhook(data: any) {
    switch (data.event) {
      case 'messages.upsert':
        await this.handleMensagemRecebida(data.data);
        break;
        
      case 'messages.update':
        await this.handleStatusMensagem(data.data);
        break;
        
      default:
        console.log(`Evento não tratado: ${data.event}`);
    }
  }
  
  private static async handleMensagemRecebida(message: any) {
    // Processar mensagem recebida
    // Ex: responder automaticamente, salvar no banco, etc
    await supabase.from('mensagens_whatsapp').insert({
      telefone: message.key.remoteJid,
      mensagem: message.message?.conversation || message.message?.extendedTextMessage?.text,
      tipo: 'recebida',
      timestamp: new Date(message.messageTimestamp * 1000),
    });
  }
  
  private static async handleStatusMensagem(status: any) {
    // Atualizar status da mensagem (enviada, entregue, lida)
    await supabase
      .from('mensagens_whatsapp')
      .update({ status: status.status })
      .eq('message_id', status.key.id);
  }
}

// Exemplos de uso
export const NotificacoesWhatsApp = {
  // Notificar cirurgia agendada
  async notificarCirurgiaAgendada(cirurgia: any) {
    const mensagem = `
🏥 *CIRURGIA AGENDADA*

📋 Procedimento: ${cirurgia.procedimento}
👤 Paciente: ${cirurgia.paciente.nome}
👨‍⚕️ Médico: ${cirurgia.medico.nome}
📅 Data: ${cirurgia.dataAgendamento}
🏢 Hospital: ${cirurgia.hospital.nome}

✅ Materiais reservados no estoque.
    `.trim();
    
    // Enviar para médico
    await ZAPIService.enviarMensagem({
      telefone: cirurgia.medico.celular,
      mensagem,
    });
    
    // Enviar para logística
    await ZAPIService.enviarMensagem({
      telefone: process.env.TELEFONE_LOGISTICA!,
      mensagem,
    });
  },
  
  // Alertar estoque baixo
  async alertarEstoqueBaixo(produto: any) {
    const mensagem = `
⚠️ *ALERTA DE ESTOQUE*

📦 Produto: ${produto.descricao}
🔢 Código: ${produto.codigoInterno}
📊 Estoque atual: ${produto.estoque} unidades
📉 Mínimo: ${produto.minimoEstoque} unidades

🛒 Solicite reposição urgente!
    `.trim();
    
    await ZAPIService.enviarMensagem({
      telefone: process.env.TELEFONE_COMPRAS!,
      mensagem,
    });
  },
  
  // Lembrete de cirurgia (2 dias antes)
  async lembrarteCirurgia(cirurgia: any) {
    const mensagem = `
⏰ *LEMBRETE DE CIRURGIA*

Sua cirurgia está agendada para *daqui 2 dias*:

📅 ${cirurgia.dataAgendamento}
🏢 ${cirurgia.hospital.nome}
👨‍⚕️ Dr(a). ${cirurgia.medico.nome}

📋 Prepare-se seguindo as orientações médicas.
    `.trim();
    
    await ZAPIService.enviarMensagem({
      telefone: cirurgia.paciente.celular,
      mensagem,
    });
  },
};
```

---

## 📊 MONITORAMENTO & OBSERVABILIDADE

### Logging Estruturado

```typescript
// server/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'icarus-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Middleware de logging
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      type: 'http_request',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });
  
  next();
};
```

### Métricas com Prometheus

```typescript
// server/utils/metrics.ts
import promClient from 'prom-client';

const register = new promClient.Registry();

// Métricas padrão
promClient.collectDefaultMetrics({ register });

// Métricas customizadas
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duração das queries no banco',
  labelNames: ['table', 'operation'],
  registers: [register],
});

export const apiErrors = new promClient.Counter({
  name: 'api_errors_total',
  help: 'Total de erros na API',
  labelNames: ['type', 'endpoint'],
  registers: [register],
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 🚀 PRÓXIMOS PASSOS

### Implementação Prioritária

1. ✅ **GraphQL Schema completo** (2-3 dias)
2. ✅ **REST endpoints CRUD básico** (3-4 dias)
3. ⏳ **Autenticação JWT + RBAC** (2 dias)
4. ⏳ **Rate limiting** (1 dia)
5. ⏳ **Integração Stripe** (2 dias)
6. ⏳ **Webhooks Z-API (SMS/WhatsApp)** (2 dias)
7. ⏳ **Monitoring com Prometheus + Grafana** (2 dias)

**Total estimado**: 2-3 semanas

---

**Este documento integra a arquitetura completa do ICARUS v5.0**

