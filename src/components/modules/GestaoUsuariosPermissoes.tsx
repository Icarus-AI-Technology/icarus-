/**
 * Componente: Gestão de Usuários e Permissões (RBAC)
 * 
 * Sistema completo de controle de acesso baseado em funções
 * Conformidade: LGPD Art. 37, ANVISA RDC 16/2013, ISO 27001
 */

import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Tooltip,
} from '@/components/oraclusx-ds';
import {
  Users,
  Shield,
  Key,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatDate, formatDateTime } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata: {
    nome?: string;
    telefone?: string;
  };
}

interface Role {
  id: string;
  nome: string;
  descricao: string;
  tipo_role: string;
  nivel_hierarquia: number;
  is_active: boolean;
}

interface Permission {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  modulo: string;
  acao: string;
  nivel_criticidade: string;
  requer_2fa: boolean;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  role: Role;
}

interface AuditLog {
  id: string;
  user_email: string;
  acao: string;
  modulo: string;
  descricao: string;
  sucesso: boolean;
  created_at: string;
  nivel_sensibilidade: string;
}

export default function GestaoUsuariosPermissoes() {
  useDocumentTitle('Gestão de Usuários e Permissões');
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles' | 'permissoes' | 'auditoria'>('usuarios');
  const [loading, setLoading] = useState(true);
  
  // Estados - Usuários
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<User | null>(null);
  const [rolesUsuario, setRolesUsuario] = useState<UserRole[]>([]);
  const [searchUsuario, setSearchUsuario] = useState('');
  
  // Estados - Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleSelecionada, setRoleSelecionada] = useState<Role | null>(null);
  const [permissoesRole, setPermissoesRole] = useState<Permission[]>([]);
  
  // Estados - Permissões
  const [permissoes, setPermissoes] = useState<Permission[]>([]);
  const [filterModulo, setFilterModulo] = useState<string>('todos');
  
  // Estados - Auditoria
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filterAuditModulo, setFilterAuditModulo] = useState<string>('todos');
  
  // Dialogs
  const [_, setShowNovoUsuarioDialog] = useState(false);
  const [showAtribuirRoleDialog, setShowAtribuirRoleDialog] = useState(false);
  const [__unusedShowNovaRoleDialog, setShowNovaRoleDialog] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
    // carregarDados já usa activeTab internamente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (activeTab === 'usuarios') {
        await carregarUsuarios();
      } else if (activeTab === 'roles') {
        await carregarRoles();
      } else if (activeTab === 'permissoes') {
        await carregarPermissoes();
      } else if (activeTab === 'auditoria') {
        await carregarAuditoria();
      }
    } catch (error: unknown) {
        const err = error as Error;
      addToast(`Erro ao carregar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarUsuarios = async () => {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    setUsuarios(
      data.users.map((u) => ({
        id: u.id,
        email: u.email ?? '',
        created_at: u.created_at ?? new Date().toISOString(),
        last_sign_in_at: (u.last_sign_in_at as unknown as string) ?? undefined,
        user_metadata: {
          nome: (u.user_metadata as Record<string, unknown>)?.nome as string | undefined,
          telefone: (u.user_metadata as Record<string, unknown>)?.telefone as string | undefined,
        },
      }))
    );
  };

  const carregarRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('nivel_hierarquia', { ascending: true });
    if (error) throw error;
    setRoles(data || []);
  };

  const carregarPermissoes = async () => {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('modulo', { ascending: true });
    if (error) throw error;
    setPermissoes(data || []);
  };

  const carregarAuditoria = async () => {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    setAuditLogs(data || []);
  };

  const carregarRolesUsuario = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, role:roles(*)')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) throw error;
    setRolesUsuario(data || []);
  };

  const carregarPermissoesRole = async (roleId: string) => {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*, permission:permissions(*)')
      .eq('role_id', roleId);
    if (error) throw error;
    setPermissoesRole(
      (data || [])
        .map((rp) => (rp as unknown as { permission?: Permission }).permission)
        .filter((p): p is Permission => !!p)
    );
  };

  const handleSelecionarUsuario = async (usuario: User) => {
    setUsuarioSelecionado(usuario);
    await carregarRolesUsuario(usuario.id);
  };

  const handleSelecionarRole = async (role: Role) => {
    setRoleSelecionada(role);
    await carregarPermissoesRole(role.id);
  };

  const handleAtribuirRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      // Log de auditoria
      await supabase.rpc('log_audit', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_acao: 'role.atribuir',
        p_modulo: 'usuarios',
        p_descricao: `Role atribuída ao usuário ${userId}`,
        p_nivel_sensibilidade: 'alto',
      });

      addToast('Role atribuída com sucesso!', 'success');
      setShowAtribuirRoleDialog(false);
      if (usuarioSelecionado) {
        carregarRolesUsuario(usuarioSelecionado.id);
      }
    } catch (error: unknown) {
        const err = error as Error;
      addToast(`Erro ao atribuir role: ${error.message}`, 'error');
    }
  };

  const handleRevogarRole = async (userRoleId: string) => {
    if (!confirm('Tem certeza que deseja revogar esta role?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', userRoleId);

      if (error) throw error;

      addToast('Role revogada com sucesso!', 'success');
      if (usuarioSelecionado) {
        carregarRolesUsuario(usuarioSelecionado.id);
      }
    } catch (error: unknown) {
        const err = error as Error;
      addToast(`Erro ao revogar role: ${error.message}`, 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    u.user_metadata?.nome?.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  const permissoesFiltradas = permissoes.filter((p) =>
    filterModulo === 'todos' || p.modulo === filterModulo
  );

  const auditLogsFiltrados = auditLogs.filter((log) =>
    filterAuditModulo === 'todos' || log.modulo === filterAuditModulo
  );

  const modulos = Array.from(new Set(permissoes.map((p) => p.modulo)));
  const modulosAudit = Array.from(new Set(auditLogs.map((log) => log.modulo)));

  const renderTabUsuarios = () => (
    <div className="space-y-6">
      {/* Header com busca e ações */}
      <div className="flex items-center justify-between gap-4">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Buscar usuários por email ou nome..."
          value={searchUsuario}
          onChange={(e) => setSearchUsuario(e.target.value)}
          className="flex-1"
        />
        <Button
          icon={<UserPlus />}
          onClick={() => setShowNovoUsuarioDialog(true)}
        >
          Novo Usuário
        </Button>
        <Button
          variant="secondary"
          icon={<RefreshCw />}
          onClick={carregarUsuarios}
        >
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de usuários */}
        <Card className="lg:col-span-1 p-4 neuro-raised">
          <h3 className="mb-4 flex items-center gap-2 text-[0.813rem] orx-orx-font-semibold">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            Usuários ({usuariosFiltrados.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {usuariosFiltrados.map((usuario) => (
              <button
                key={usuario.id}
                onClick={() => handleSelecionarUsuario(usuario)}
                className={`w-full p-3 rounded-lg transition-all text-left ${
                  usuarioSelecionado?.id === usuario.id
                    ? 'neuro-raised bg-[var(--primary)]/10'
                    : 'neuro-flat hover:neuro-raised'
                }`}
              >
                <div className="truncate text-[0.813rem] orx-orx-font-medium">{usuario.email}</div>
                {usuario.user_metadata?.nome && (
                  <div className="text-[var(--text-secondary)] truncate text-[0.813rem]">
                    {usuario.user_metadata.nome}
                  </div>
                )}
                <div className="text-[var(--text-secondary)] mt-1 text-[0.813rem]">
                  Cadastro: {formatDate(usuario.created_at)}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Detalhes do usuário selecionado */}
        <Card className="lg:col-span-2 p-6 neuro-raised">
          {usuarioSelecionado ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-[0.813rem] orx-orx-font-semibold">{usuarioSelecionado.email}</h3>
                  {usuarioSelecionado.user_metadata?.nome && (
                    <p className="text-[var(--text-secondary)]">{usuarioSelecionado.user_metadata.nome}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Tooltip content="Editar Usuário">
                    <Button variant="ghost" size="sm" icon={<Edit />} />
                  </Tooltip>
                  <Tooltip content="Bloquear Usuário">
                    <Button variant="ghost" size="sm" icon={<Lock />} />
                  </Tooltip>
                </div>
              </div>

              {/* Roles do usuário */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-2 orx-orx-font-semibold">
                    <Shield className="w-4 h-4 text-[var(--primary)]" />
                    Funções Atribuídas
                  </h4>
                  <Button
                    size="sm"
                    icon={<UserPlus />}
                    onClick={() => setShowAtribuirRoleDialog(true)}
                  >
                    Atribuir Função
                  </Button>
                </div>
                {rolesUsuario.length === 0 ? (
                  <div className="text-center py-6 neuro-flat rounded-lg text-[var(--text-secondary)]">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma função atribuída</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rolesUsuario.map((ur) => (
                      <div
                        key={ur.id}
                        className="p-3 neuro-flat rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="orx-orx-font-medium">{ur.role.nome}</div>
                          <div className="text-[var(--text-secondary)] text-[0.813rem]">
                            {ur.role.descricao}
                          </div>
                          {ur.valid_until && (
                            <div className="text-orange-500 mt-1 flex items-center gap-1 text-[0.813rem]">
                              <Clock className="w-3 h-3" />
                              Expira em: {formatDate(ur.valid_until)}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4 text-error" />}
                          onClick={() => handleRevogarRole(ur.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações adicionais */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--text-secondary)]/20">
                <div className="neuro-inset p-3 rounded-lg">
                  <div className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">Cadastrado em</div>
                  <div className="orx-orx-font-medium">{formatDate(usuarioSelecionado.created_at)}</div>
                </div>
                <div className="neuro-inset p-3 rounded-lg">
                  <div className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">Último acesso</div>
                  <div className="orx-orx-font-medium">
                    {usuarioSelecionado.last_sign_in_at
                      ? formatDateTime(usuarioSelecionado.last_sign_in_at)
                      : 'Nunca'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecione um usuário para ver os detalhes</p>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog: Atribuir Role */}
      <Dialog open={showAtribuirRoleDialog} onOpenChange={setShowAtribuirRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Função ao Usuário</DialogTitle>
            <DialogDescription>
              Selecione uma função para atribuir ao usuário {usuarioSelecionado?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {roles.filter((r) => r.is_active).map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  if (usuarioSelecionado) {
                    handleAtribuirRole(usuarioSelecionado.id, role.id);
                  }
                }}
                className="w-full p-3 neuro-flat hover:neuro-raised rounded-lg transition-all text-left"
              >
                <div className="orx-orx-font-medium">{role.nome}</div>
                <div className="text-[var(--text-secondary)] text-[0.813rem]">{role.descricao}</div>
                <Badge variant="default" className="mt-2">
                  {role.tipo_role}
                </Badge>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderTabRoles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.813rem] orx-orx-font-semibold">Funções e Permissões</h2>
        <Button icon={<UserPlus />} onClick={() => setShowNovaRoleDialog(true)}>
          Nova Função
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de roles */}
        <Card className="lg:col-span-1 p-4 neuro-raised">
          <h3 className="mb-4 text-[0.813rem] orx-orx-font-semibold">Funções ({roles.length})</h3>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelecionarRole(role)}
                className={`w-full p-3 rounded-lg transition-all text-left ${
                  roleSelecionada?.id === role.id
                    ? 'neuro-raised bg-[var(--primary)]/10'
                    : 'neuro-flat hover:neuro-raised'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.813rem] orx-orx-font-medium">{role.nome}</span>
                  {!role.is_active && (
                    <Badge variant="default" className="bg-error/20 text-error">
                      Inativa
                    </Badge>
                  )}
                </div>
                <div className="text-[var(--text-secondary)] text-[0.813rem]">{role.descricao}</div>
                <Badge variant="default" className="mt-2 text-[0.813rem]">
                  {role.tipo_role}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Permissões da role selecionada */}
        <Card className="lg:col-span-2 p-6 neuro-raised">
          {roleSelecionada ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[0.813rem] orx-orx-font-semibold">{roleSelecionada.nome}</h3>
                  <p className="text-[var(--text-secondary)]">{roleSelecionada.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" icon={<Edit />} />
                  {!roleSelecionada.is_system && (
                    <Button variant="ghost" size="sm" icon={<Trash2 className="text-error" />} />
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-3 orx-orx-font-semibold">
                  Permissões ({permissoesRole.length})
                </h4>
                {permissoesRole.length === 0 ? (
                  <div className="text-center py-6 neuro-flat rounded-lg text-[var(--text-secondary)]">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma permissão atribuída</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {permissoesRole.map((perm) => (
                      <div
                        key={perm.id}
                        className="p-3 neuro-flat rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="text-[0.813rem] orx-orx-font-medium">{perm.nome}</div>
                          <div className="text-[var(--text-secondary)] text-[0.813rem]">
                            {perm.modulo}.{perm.acao}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="default"
                            className={`orx-text-xs ${
                              perm.nivel_criticidade === 'critico'
                                ? 'bg-error/20 text-error'
                                : perm.nivel_criticidade === 'alto'
                                ? 'bg-orange-500/20 text-orange-500'
                                : perm.nivel_criticidade === 'medio'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-success/20 text-success'
                            }`}
                          >
                            {perm.nivel_criticidade}
                          </Badge>
                          {perm.requer_2fa && (
                            <Tooltip content="Requer 2FA">
                              <ShieldAlert className="w-4 h-4 text-orange-500" />
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecione uma função para ver as permissões</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderTabPermissoes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Select
          label="Filtrar por Módulo"
          value={filterModulo}
          onValueChange={setFilterModulo}
          options={[
            { value: 'todos', label: 'Todos os Módulos' },
            ...modulos.map((m) => ({ value: m, label: m })),
          ]}
          className="w-[250px]"
        />
      </div>

      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>2FA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissoesFiltradas.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell className="font-mono text-[0.813rem]">{perm.codigo}</TableCell>
                <TableCell>{perm.nome}</TableCell>
                <TableCell>
                  <Badge variant="default">{perm.modulo}</Badge>
                </TableCell>
                <TableCell>{perm.acao}</TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={`${
                      perm.nivel_criticidade === 'critico'
                        ? 'bg-error/20 text-error'
                        : perm.nivel_criticidade === 'alto'
                        ? 'bg-orange-500/20 text-orange-500'
                        : perm.nivel_criticidade === 'medio'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-success/20 text-success'
                    }`}
                  >
                    {perm.nivel_criticidade}
                  </Badge>
                </TableCell>
                <TableCell>
                  {perm.requer_2fa ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderTabAuditoria = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Select
          label="Filtrar por Módulo"
          value={filterAuditModulo}
          onValueChange={setFilterAuditModulo}
          options={[
            { value: 'todos', label: 'Todos os Módulos' },
            ...modulosAudit.map((m) => ({ value: m, label: m })),
          ]}
          className="w-[250px]"
        />
        <Button icon={<Download />} variant="secondary">
          Exportar Logs
        </Button>
      </div>

      <Card className="neuro-raised p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sensibilidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogsFiltrados.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-[0.813rem]">
                  {formatDateTime(log.created_at)}
                </TableCell>
                <TableCell>{log.user_email}</TableCell>
                <TableCell className="font-mono text-[0.813rem]">{log.acao}</TableCell>
                <TableCell>
                  <Badge variant="default">{log.modulo}</Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-[0.813rem]">
                  {log.descricao}
                </TableCell>
                <TableCell>
                  {log.sucesso ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={`orx-text-xs ${
                      log.nivel_sensibilidade === 'restrito'
                        ? 'bg-error/20 text-error'
                        : log.nivel_sensibilidade === 'confidencial'
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'bg-[var(--primary)]/20 text-[var(--primary)]'
                    }`}
                  >
                    {log.nivel_sensibilidade}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Gestão de Usuários e Permissões
            </h1>
            <p className="text-[var(--text-secondary)]">
              Controle de acesso baseado em funções (RBAC) com auditoria LGPD
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl neuro-raised flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-body-sm text-[var(--text-primary)] orx-orx-font-medium">
              Conformidade LGPD
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: 'usuarios', label: 'Usuários', icon: Users },
            { id: 'roles', label: 'Funções', icon: Shield },
            { id: 'permissoes', label: 'Permissões', icon: Key },
            { id: 'auditoria', label: 'Auditoria', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl orx-orx-font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'neuro-raised text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === 'usuarios' && renderTabUsuarios()}
        {activeTab === 'roles' && renderTabRoles()}
        {activeTab === 'permissoes' && renderTabPermissoes()}
        {activeTab === 'auditoria' && renderTabAuditoria()}
      </div>
    </div>
  );
}

