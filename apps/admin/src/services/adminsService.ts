import { supabase } from '@/lib/supabase';
import type { ApiResponse, User } from '@cee/types';

export type AdminProfile = User & { created_at: string };

interface AdminProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  is_active: boolean;
  is_superadmin: boolean;
  avatar_url: string | null;
  created_at: string;
}

function rowToAdminProfile(row: AdminProfileRow): AdminProfile {
  return {
    id:            row.id,
    name:          row.name,
    email:         row.email,
    role:          row.role,
    avatarUrl:     row.avatar_url ?? '',
    is_superadmin: row.is_superadmin,
    is_active:     row.is_active,
    created_at:    row.created_at,
  };
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password?: string;
}

export type AdminAction = 'toggle_status' | 'promote' | 'demote';

export const adminsService = {
  async getAdmins(): Promise<ApiResponse<AdminProfile[] | null>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as AdminProfileRow[]).map(rowToAdminProfile), error: undefined };
  },

  async createAdmin(input: CreateAdminInput): Promise<ApiResponse<null>> {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: input,
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return { data: null, error: undefined };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Error al crear administrador' };
    }
  },

  /**
   * action: 'promote' (Admin -> Super Admin) | 'demote' (Super Admin -> Admin) | 'toggle_status' (Activo/Inhabilitado).
   * La salvaguarda de "nunca dejar el sistema sin ningún Super Admin activo" vive
   * en un trigger de la base de datos (fuente de verdad real); esta llamada solo
   * reenvía la acción a la Edge Function, que a su vez deja que el trigger
   * rechace la operación si corresponde.
   */
  async toggleAdminStatus(
    targetUserId: string,
    action: AdminAction,
    isActive?: boolean,
  ): Promise<ApiResponse<null>> {
    try {
      const { data, error } = await supabase.functions.invoke('toggle-admin-status', {
        body: { targetUserId, action, isActive },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return { data: null, error: undefined };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Error al ejecutar la acción' };
    }
  },
};
