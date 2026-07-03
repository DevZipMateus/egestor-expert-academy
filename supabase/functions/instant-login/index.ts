import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, redirectTo } = await req.json();

    console.log("[instant-login] Request received for email:", email);

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Email e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use env vars from the edge runtime (never trust client-supplied URL)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[instant-login] Missing env vars", {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey,
      });
      return new Response(
        JSON.stringify({ error: "Configuração do servidor inválida" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to create the user; if already exists, just continue.
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { nome: name },
    });

    if (createError) {
      const msg = (createError.message || "").toLowerCase();
      const alreadyExists =
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("exists") ||
        (createError as any).code === "email_exists";

      if (!alreadyExists) {
        console.error("[instant-login] createUser error:", createError);
        return new Response(
          JSON.stringify({ error: "Erro ao criar usuário", details: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("[instant-login] User already exists, proceeding to magic link");
    } else {
      console.log("[instant-login] User created");
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: redirectTo || `${supabaseUrl}/auth/callback`,
      },
    });

    if (linkError) {
      console.error("[instant-login] generateLink error:", linkError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar link de acesso", details: linkError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[instant-login] Magic link generated successfully");

    return new Response(
      JSON.stringify({
        action_link: linkData.properties.action_link,
        email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[instant-login] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor", details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
