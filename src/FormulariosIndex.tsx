/**
 * ÍNDICE DE FORMULÁRIOS - OraclusX DS Neumorphic 3D
 * 
 * Página de navegação centralizada para todos os formulários do sistema
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import {
  User, Building, UserCheck, Truck, Package, Shield,
  Users, FileText, Calendar, ShoppingCart, DollarSign,
  CreditCard, TrendingUp, MapPin, Search
} from 'lucide-react';

interface FormularioCard {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  rota: string;
  categoria: 'cadastros' | 'operacional' | 'financeiro';
  cor: string;
}

export default function FormulariosIndex() {
  const navigate = useNavigate();

  const formularios: FormularioCard[] = [
    // CADASTROS
    {
      id: 'medicos',
      titulo: 'Médicos',
      descricao: 'Cadastro completo com validação CRM/CFM',
      icone: <User className="w-8 h-8" />,
      rota: '/cadastros/medicos/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'hospitais',
      titulo: 'Hospitais e Clínicas',
      descricao: 'Cadastro de estabelecimentos de saúde',
      icone: <Building className="w-8 h-8" />,
      rota: '/cadastros/hospitais/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'pacientes',
      titulo: 'Pacientes',
      descricao: 'Cadastro com proteção LGPD',
      icone: <UserCheck className="w-8 h-8" />,
      rota: '/cadastros/pacientes/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'fornecedores',
      titulo: 'Fornecedores OPME',
      descricao: 'Cadastro de fornecedores e distribuidores',
      icone: <Truck className="w-8 h-8" />,
      rota: '/cadastros/fornecedores/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'produtos',
      titulo: 'Produtos OPME',
      descricao: 'Cadastro com registro ANVISA',
      icone: <Package className="w-8 h-8" />,
      rota: '/cadastros/produtos/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'convenios',
      titulo: 'Convênios',
      descricao: 'Planos de saúde e operadoras',
      icone: <Shield className="w-8 h-8" />,
      rota: '/cadastros/convenios/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'equipes',
      titulo: 'Equipes Médicas',
      descricao: 'Equipes multidisciplinares',
      icone: <Users className="w-8 h-8" />,
      rota: '/cadastros/equipes/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },
    {
      id: 'transportadoras',
      titulo: 'Transportadoras',
      descricao: 'Empresas de transporte e logística',
      icone: <Truck className="w-8 h-8" />,
      rota: '/cadastros/transportadoras/novo',
      categoria: 'cadastros',
      cor: '#5E35B1'
    },

    // OPERACIONAIS
    {
      id: 'cirurgias',
      titulo: 'Cirurgias',
      descricao: 'Agendamento de procedimentos cirúrgicos',
      icone: <Calendar className="w-8 h-8" />,
      rota: '/operacional/cirurgias/novo',
      categoria: 'operacional',
      cor: '#3B82F6'
    },
    {
      id: 'pedidos',
      titulo: 'Pedidos de Compra',
      descricao: 'Solicitações e pedidos de materiais',
      icone: <ShoppingCart className="w-8 h-8" />,
      rota: '/operacional/pedidos/novo',
      categoria: 'operacional',
      cor: '#3B82F6'
    },
    {
      id: 'remessas',
      titulo: 'Remessas Consignação',
      descricao: 'Envio de materiais consignados',
      icone: <Package className="w-8 h-8" />,
      rota: '/operacional/remessas/novo',
      categoria: 'operacional',
      cor: '#3B82F6'
    },
    {
      id: 'estoque',
      titulo: 'Movimentação Estoque',
      descricao: 'Entradas, saídas e ajustes',
      icone: <TrendingUp className="w-8 h-8" />,
      rota: '/operacional/estoque/novo',
      categoria: 'operacional',
      cor: '#3B82F6'
    },
    {
      id: 'entregas',
      titulo: 'Entregas Logísticas',
      descricao: 'Agendamento e rastreamento',
      icone: <MapPin className="w-8 h-8" />,
      rota: '/operacional/entregas/novo',
      categoria: 'operacional',
      cor: '#3B82F6'
    },
    {
      id: 'cotacoes',
      titulo: 'Cotações',
      descricao: 'Cotações multi-fornecedor',
      icone: <Search className="w-8 h-8" />,
      rota: '/operacional/cotacoes/novo',
      categoria: 'operacional',
      cor: '#3B82F6'
    },

    // FINANCEIROS
    {
      id: 'contas-receber',
      titulo: 'Contas a Receber',
      descricao: 'Títulos a receber de clientes',
      icone: <DollarSign className="w-8 h-8" />,
      rota: '/financeiro/contas-receber/novo',
      categoria: 'financeiro',
      cor: '#10B981'
    },
    {
      id: 'contas-pagar',
      titulo: 'Contas a Pagar',
      descricao: 'Títulos a pagar para fornecedores',
      icone: <CreditCard className="w-8 h-8" />,
      rota: '/financeiro/contas-pagar/novo',
      categoria: 'financeiro',
      cor: '#10B981'
    },
    {
      id: 'notas-fiscais',
      titulo: 'Notas Fiscais',
      descricao: 'Emissão de NF-e (entrada/saída)',
      icone: <FileText className="w-8 h-8" />,
      rota: '/financeiro/notas-fiscais/novo',
      categoria: 'financeiro',
      cor: '#10B981'
    }
  ];

  const categorias = {
    cadastros: { titulo: 'Cadastros', cor: '#5E35B1' },
    operacional: { titulo: 'Operacional', cor: '#3B82F6' },
    financeiro: { titulo: 'Financeiro', cor: '#10B981' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EAF6] to-[#F3E5F5] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            Formulários do Sistema
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acesse os formulários de cadastro organizados por categoria
          </p>
        </div>

        {/* Por Categoria */}
        {Object.entries(categorias).map(([key, cat]) => {
          const formsCategoria = formularios.filter(f => f.categoria === key);

          return (
            <div key={key} className="mb-8">
              {/* Título da Categoria */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: cat.cor }}
                />
                <h2 className="text-xl font-semibold text-gray-800">
                  {cat.titulo}
                </h2>
                <span className="text-sm text-gray-500">
                  ({formsCategoria.length} formulários)
                </span>
              </div>

              {/* Grid de Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {formsCategoria.map(form => (
                  <button type="button"
                    key={form.id}
                    onClick={() => navigate(form.rota)}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6
                               shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.8)]
                               hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.9)]
                               hover:-translate-y-1
                               transition-all duration-200
                               text-left group"
                  >
                    {/* Ícone */}
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4
                                 bg-gradient-to-br from-purple-100 to-purple-200
                                 shadow-[3px_3px_6px_rgba(94,53,177,0.2),-3px_-3px_6px_rgba(255,255,255,1)]
                                 group-hover:shadow-[5px_5px_10px_rgba(94,53,177,0.3),-5px_-5px_10px_rgba(255,255,255,1)]
                                 transition-all duration-200"
                      style={{ color: form.cor }}
                    >
                      {form.icone}
                    </div>

                    {/* Título */}
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {form.titulo}
                    </h3>

                    {/* Descrição */}
                    <p className="text-sm text-gray-500">
                      {form.descricao}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

