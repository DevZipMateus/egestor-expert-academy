import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, redirectTo, supabaseUrl } = await req.json();

    console.log('[admin-instant-login] Request received:', { email, name, redirectTo });

    // Validate required fields
    if (!email || !name || !redirectTo || !supabaseUrl) {
      console.error('[admin-instant-login] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, redirectTo, supabaseUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin allowlist
    const ADMIN_EMAILS = [
      'mateus.pinto@zipline.com.br',
      'joseph@zipline.com.br',
      'louise@zipline.com.br',
      'camilaw@zipline.com.br',
      'juliana@zipline.com.br',
      'gian@zipline.com.br',
      'ricardo@zipline.com.br',
      'alan@zipline.com.br',
      'escobar@zipline.com.br'
    ];

    // Validate email is in allowlist
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      console.warn('[admin-instant-login] Unauthorized email attempt:', email);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: email not in admin allowlist' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get service role key
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      console.error('[admin-instant-login] SUPABASE_SERVICE_ROLE_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user exists
    const { data: existingUsers, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('[admin-instant-login] Error fetching users:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error checking user existence' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userExists = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    // Create user if doesn't exist
    if (!userExists) {
      console.log('[admin-instant-login] Creating new admin user:', email);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          nome: name
        }
      });

      if (createError) {
        console.error('[admin-instant-login] Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Error creating user', details: createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-instant-login] User created successfully:', newUser.user.id);
    } else {
      console.log('[admin-instant-login] User already exists:', userExists.id);
    }

    // Generate magic link
    console.log('[admin-instant-login] Generating magic link for:', email);
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    });

    if (linkError) {
      console.error('[admin-instant-login] Error generating magic link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Error generating magic link', details: linkError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-instant-login] Magic link generated successfully');

    return new Response(
      JSON.stringify({ 
        action_link: linkData.properties.action_link,
        email: email 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[admin-instant-login] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
