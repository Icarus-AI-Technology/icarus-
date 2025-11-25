// src/pages/CirurgiasPage.tsx
import { useState, useEffect } from 'react';
import { legacySupabase as supabase } from '../lib/legacySupabase';
import { Card } from '../components/oraclusx-ds/Card';
import { Badge } from '../components/oraclusx-ds/Badge';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Building2,
} from 'lucide-react';
import type { Database } from '../lib/database.types.generated';

type CirurgiaBase = Database['public']['Tables']['cirurgias']['Row'];
type Cirurgia = CirurgiaBase & {
  tipo_cirurgia?: string | null;
  hora_inicio?: string | null;
  duracao_estimada?: number | null;
};

export default function CirurgiasPage() {
  const [cirurgias, setCirurgias] = useState<Cirurgia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    fetchCirurgias();
  }, []);

  async function fetchCirurgias() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cirurgias')
        .select('*')
        .is('excluido_em', null)
        .order('data_cirurgia', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCirurgias((data || []) as Cirurgia[]);
    } catch (err) {
      console.error('Erro ao buscar cirurgias:', err);
      setError('Erro ao carregar cirurgias');
    } finally {
      setLoading(false);
    }
  }

  // Filtrar cirurgias
  const cirurgiasFiltradas = cirurgias.filter((cirurgia) => {
    const matchSearch =
      cirurgia.medico_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirurgia.hospital_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirurgia.tipo_cirurgia?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'todos' || cirurgia.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Estatísticas
  const stats = {
    total: cirurgias.length,
    agendadas: cirurgias.filter((c) => c.status === 'agendada').length,
    emAndamento: cirurgias.filter((c) => c.status === 'em_andamento').length,
    concluidas: cirurgias.filter((c) => c.status === 'concluida').length,
    canceladas: cirurgias.filter((c) => c.status === 'cancelada').length,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'agendada':
        return <Badge variant="default">Agendada</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-600">Em Andamento</Badge>;
      case 'concluida':
        return <Badge className="bg-green-600">Concluída</Badge>;
      case 'cancelada':
        return <Badge variant="error">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status || 'N/A'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 bg-destructive/10">
          <p className="text-destructive font-semibold">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Cirurgias</h1>
          <p className="text-muted-foreground mt-1">
            Agendar e acompanhar procedimentos cirúrgicos
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Agendar Cirurgia
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Agendadas</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.agendadas}</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.emAndamento}</h3>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.concluidas}</h3>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Canceladas</p>
              <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.canceladas}</h3>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por médico, hospital ou tipo de cirurgia..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos Status</option>
              <option value="agendada">Agendadas</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluídas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </Card>

      {/* Cirurgias Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Data</th>
                <th className="text-left p-3 font-semibold">Tipo</th>
                <th className="text-left p-3 font-semibold">Médico</th>
                <th className="text-left p-3 font-semibold">Hospital</th>
                <th className="text-center p-3 font-semibold">Duração (min)</th>
                <th className="text-center p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cirurgiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'todos'
                      ? 'Nenhuma cirurgia encontrada com os filtros aplicados'
                      : 'Nenhuma cirurgia agendada'}
                  </td>
                </tr>
              ) : (
                cirurgiasFiltradas.map((cirurgia) => (
                  <tr
                    key={cirurgia.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {cirurgia.data_cirurgia
                            ? new Date(cirurgia.data_cirurgia).toLocaleDateString('pt-BR')
                            : 'N/A'}
                        </span>
                      </div>
                      {cirurgia.hora_inicio && (
                        <p className="text-sm text-muted-foreground ml-6">{cirurgia.hora_inicio}</p>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{cirurgia.tipo_cirurgia || 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cirurgia.medico_id?.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cirurgia.hospital_id?.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-medium">{cirurgia.duracao_estimada || 'N/A'}</span>
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(cirurgia.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-primary hover:underline text-sm">Ver</button>
                        <button className="text-muted-foreground hover:underline text-sm">
                          Materiais
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
