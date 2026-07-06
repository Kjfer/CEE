import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@cee/types';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  is_active: boolean;
  is_superadmin: boolean;
  created_at: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password?: string;
}

export const adminsService = {
  async getAdmins(): Promise<ApiResponse<AdminProfile[]>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null as any, error: error.message };
    }

    return { data: data as AdminProfile[], error: undefined };
  },

  async createAdmin(input: CreateAdminInput): Promise<ApiResponse<null>> {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: input,
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return { data: null as any, error: undefined };
    } catch (e: any) {
      return { data: null as any, error: e.message || 'Error al crear administrador' };
    }
  },

  async toggleAdminStatus(targetUserId: string, action: 'toggle_status' | 'promote', isActive?: boolean): Promise<ApiResponse<null>> {
    try {
      const { data, error } = await supabase.functions.invoke('toggle-admin-status', {
        body: { targetUserId, action, isActive },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return { data: null as any, error: undefined };
    } catch (e: any) {
      return { data: null as any, error: e.message || 'Error al actualizar estado' };
    }
  }
};
