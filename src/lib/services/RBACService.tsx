/**
 * Service: RBAC (Role-Based Access Control)
 * 
 * Gerenciamento de permissões e controle de acesso
 * Conformidade: LGPD Art. 37, ISO 27001
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldX } from 'lucide-react';

export interface Permission {
  id: string;
  codigo: string;
  nome: string;
  modulo: string;
  acao: string;
  nivel_criticidade: 'baixo' | 'medio' | 'alto' | 'critico';
  requer_2fa: boolean;
}

export interface Role {
  id: string;
  nome: string;
  descricao: string;
  tipo_role: string;
  nivel_hierarquia: number;
  is_active: boolean;
}

export class RBACService {
  /**
   * Verificar se usuário tem permissão específica
   */
  static async userHasPermission(
    userId: string,
    permissionCode: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_has_permission', {
        p_user_id: userId,
        p_permission_code: permissionCode,
      });

      if (error) {
        console.error('[RBAC] Erro ao verificar permissão:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('[RBAC] Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Obter todas as permissões efetivas de um usuário
   */
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('vw_user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[RBAC] Erro ao obter permissões do usuário:', error);
      return [];
    }
  }

  /**
   * Obter roles de um usuário
   */
  static async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, role:roles(*)')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return (
        data?.map((record) => record.role as Role | null).filter((role): role is Role => role !== null) || []
      );
    } catch (error) {
      console.error('[RBAC] Erro ao obter roles do usuário:', error);
      return [];
    }
  }

  /**
   * Verificar se usuário tem role específica
   */
  static async userHasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, role:roles(nome)')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return data?.some((record) => record.role?.nome === roleName) || false;
    } catch (error) {
      console.error('[RBAC] Erro ao verificar role:', error);
      return false;
    }
  }

  /**
   * Atribuir role a usuário
   */
  static async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    validUntil?: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
        valid_until: validUntil?.toISOString(),
      });

      if (error) throw error;

      // Log de auditoria
      await this.logAudit(assignedBy, 'role.atribuir', 'usuarios', {
        user_id: userId,
        role_id: roleId,
      });

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[RBAC] Erro ao atribuir role:', err.message ?? err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Revogar role de usuário
   */
  static async revokeRole(
    userRoleId: string,
    revokedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', userRoleId);

      if (error) throw error;

      // Log de auditoria
      await this.logAudit(revokedBy, 'role.revogar', 'usuarios', {
        user_role_id: userRoleId,
      });

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[RBAC] Erro ao revogar role:', err.message ?? err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Conceder permissão excepcional (override)
   */
  static async grantPermissionOverride(
    userId: string,
    permissionId: string,
    motivo: string,
    grantedBy: string,
    validUntil?: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_permissions_override').insert({
        user_id: userId,
        permission_id: permissionId,
        tipo_override: 'grant',
        motivo,
        created_by: grantedBy,
        valid_until: validUntil?.toISOString(),
      });

      if (error) throw error;

      // Log de auditoria (alto nível de sensibilidade)
      await this.logAudit(
        grantedBy,
        'permission.override_grant',
        'usuarios',
        { user_id: userId, permission_id: permissionId, motivo },
        'critico'
      );

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[RBAC] Erro ao conceder override:', err.message ?? err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Revogar permissão excepcional (override negação)
   */
  static async revokePermissionOverride(
    userId: string,
    permissionId: string,
    motivo: string,
    revokedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_permissions_override').insert({
        user_id: userId,
        permission_id: permissionId,
        tipo_override: 'revoke',
        motivo,
        created_by: revokedBy,
      });

      if (error) throw error;

      // Log de auditoria
      await this.logAudit(
        revokedBy,
        'permission.override_revoke',
        'usuarios',
        { user_id: userId, permission_id: permissionId, motivo },
        'critico'
      );

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[RBAC] Erro ao revogar override:', err.message ?? err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Criar nova sessão de usuário
   */
  static async createSession(
    userId: string,
    sessionToken: string,
    ipAddress: string,
    userAgent: string,
    expiresAt: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_sessions').insert({
        user_id: userId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[RBAC] Erro ao criar sessão:', error);
        return { success: false, error: error.message };
      }

      console.error('[RBAC] Erro ao criar sessão:', error);
      return { success: false, error: 'Erro desconhecido ao criar sessão' };
    }
  }

  /**
   * Terminar sessão
   */
  static async terminateSession(
    sessionId: string,
    terminatedBy: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          terminated_by: terminatedBy,
          termination_reason: reason,
        })
        .eq('id', sessionId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[RBAC] Erro ao terminar sessão:', error);
        return { success: false, error: error.message };
      }

      console.error('[RBAC] Erro ao terminar sessão:', error);
      return { success: false, error: 'Erro desconhecido ao terminar sessão' };
    }
  }

  /**
   * Obter sessões ativas de um usuário
   */
  static async getActiveSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('vw_active_sessions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao obter sessões ativas:', err);
      return [];
    }
  }

  /**
   * Limpar sessões expiradas
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_sessions');

      if (error) throw error;

      const cleaned = typeof data === 'number' ? data : Number(data ?? 0) || 0;
      console.log(`[RBAC] ${cleaned} sessões expiradas limpas`);
      return cleaned;
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao limpar sessões expiradas:', err);
      return 0;
    }
  }

  /**
   * Registrar tentativa de login falhada
   */
  static async logFailedLoginAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    motivoFalha: string
  ): Promise<void> {
    try {
      await supabase.from('failed_login_attempts').insert({
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        motivo_falha: motivoFalha,
      });
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao registrar tentativa falha:', err);
    }
  }

  /**
   * Verificar se deve bloquear login (muitas tentativas falhadas)
   */
  static async shouldBlockLogin(
    email: string,
    ipAddress: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_failed_login_attempts', {
        p_email: email,
        p_ip_address: ipAddress,
        p_time_window_minutes: 15,
        p_max_attempts: 5,
      });

      if (error) throw error;

      return data === true;
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao verificar bloqueio:', err);
      return false;
    }
  }

  /**
   * Registrar no log de auditoria
   */
  static async logAudit(
    userId: string,
    acao: string,
    modulo: string,
    detalhes: Record<string, unknown> | null = null,
    nivelSensibilidade: 'interno' | 'sensivel' | 'sigiloso' | 'critico' = 'interno'
  ): Promise<void> {
    try {
      await supabase.rpc('log_audit', {
        p_user_id: userId,
        p_acao: acao,
        p_modulo: modulo,
        p_descricao: detalhes ? JSON.stringify(detalhes) : null,
        p_nivel_sensibilidade: nivelSensibilidade,
      });
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao registrar auditoria:', err);
    }
  }

  /**
   * Obter logs de auditoria
   */
  static async getAuditLogs(filters?: {
    userId?: string;
    modulo?: string;
    acao?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.modulo) {
        query = query.eq('modulo', filters.modulo);
      }
      if (filters?.acao) {
        query = query.eq('acao', filters.acao);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao obter logs de auditoria:', err);
      return [];
    }
  }

  /**
   * Exportar logs de auditoria para conformidade LGPD
   */
  static async exportAuditLogs(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const logs = await this.getAuditLogs({ startDate, endDate });

      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else {
        // CSV
        const headers = [
          'ID',
          'Data/Hora',
          'Usuário',
          'Ação',
          'Módulo',
          'Descrição',
          'Sucesso',
          'IP',
          'Sensibilidade',
        ];
        const rows = logs.map((log) => [
          log.id,
          log.created_at,
          log.user_email,
          log.acao,
          log.modulo,
          log.descricao,
          log.sucesso,
          log.ip_address,
          log.nivel_sensibilidade,
        ]);

        return [headers, ...rows].map((row) => row.join(',')).join('\n');
      }
    } catch (error) {
   const err = error as Error;
      console.error('[RBAC] Erro ao exportar logs:', err);
      return '';
    }
  }
}

/**
 * Hook React para verificação de permissões
 */
export function usePermission(permissionCode: string): boolean {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasPermission(false);
        return;
      }

      const has = await RBACService.userHasPermission(user.id, permissionCode);
      setHasPermission(has);
    };

    checkPermission();
  }, [permissionCode]);

  return hasPermission;
}

/**
 * Higher-Order Component para proteção de rotas
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
) {
  return function ProtectedComponent(props: P) {
    const hasPermission = usePermission(requiredPermission);

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ShieldX className="w-16 h-16 mx-auto mb-4 text-error" />
            <h2 className="mb-2" style={{  fontSize: '1.25rem' , fontWeight: 600 }}>Acesso Negado</h2>
            <p className="text-[var(--text-secondary)]">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...(props as P)} />;
  };
}

