import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@cee/types';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
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
      return { data: null, error: error.message };
    }

    return { data: data as AdminProfile[], error: null };
  },

  async createAdmin(input: CreateAdminInput): Promise<ApiResponse<null>> {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: input,
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return { data: null, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Error al crear administrador' };
    }
  }
};
