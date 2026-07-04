import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    const { data: profile, error: profileError } = await supabaseUserClient
      .from('profiles')
      .select('role, is_superadmin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_superadmin) {
      throw new Error('Forbidden: Solo los Super Administradores pueden realizar esta acción.');
    }

    const { targetUserId, action, isActive } = await req.json();

    if (!targetUserId || !action) {
      throw new Error('Missing required fields: targetUserId, action');
    }

    if (targetUserId === user.id) {
      throw new Error('No puedes cambiar tu propio estado.');
    }

    const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Validar que el target user no sea superadmin (un superadmin no puede inhabilitar a otro superadmin)
    const { data: targetProfile, error: targetProfileError } = await supabaseAdminClient
      .from('profiles')
      .select('is_superadmin')
      .eq('id', targetUserId)
      .single();

    if (targetProfileError || !targetProfile) {
      throw new Error('Target user no encontrado.');
    }

    if (action === 'toggle_status' && targetProfile.is_superadmin) {
      throw new Error('No puedes inhabilitar a otro Super Administrador.');
    }

    if (action === 'promote') {
      if (targetProfile.is_superadmin) throw new Error('El usuario ya es Super Administrador.');
      const { error: updateError } = await supabaseAdminClient
        .from('profiles')
        .update({ is_superadmin: true })
        .eq('id', targetUserId);
      if (updateError) throw updateError;
    } else if (action === 'toggle_status') {
      if (isActive === undefined) throw new Error('Missing isActive flag.');
      // Actualizar perfil
      const { error: updateError } = await supabaseAdminClient
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', targetUserId);

      if (updateError) throw updateError;

      // Actualizar baneos en Auth de Supabase
      const { error: banError } = await supabaseAdminClient.auth.admin.updateUserById(targetUserId, {
        ban_duration: isActive ? 'none' : '876600h',
      });

      if (banError) throw banError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
