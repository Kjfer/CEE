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

    // Cliente del usuario para verificar quién está haciendo la petición
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    // Verificar si el usuario que llama es superadmin
    const { data: profile, error: profileError } = await supabaseUserClient
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_superadmin) {
      // Devolver error si no es superadmin
      throw new Error('Forbidden: Solo los Super Administradores pueden crear otros administradores.');
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      throw new Error('Missing required fields: email, password, name');
    }

    // Cliente Admin para crear el usuario
    const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: newUser, error: createError } = await supabaseAdminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: name
      }
    });

    if (createError) throw createError;

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
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
