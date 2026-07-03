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

    console.log("[instant-login] Using supabaseUrl:", supabaseUrl);

    // Direct fetch to admin API for better error visibility
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        email_confirm: true,
        user_metadata: { nome: name },
      }),
    });

    const createText = await createRes.text();
    console.log("[instant-login] createUser status:", createRes.status, "body:", createText.slice(0, 500));

    if (!createRes.ok) {
      let parsed: any = {};
      try { parsed = JSON.parse(createText); } catch { /* html or plain text */ }
      const code = parsed?.error_code || parsed?.code || "";
      const msg = (parsed?.msg || parsed?.message || createText || "").toLowerCase();
      const alreadyExists =
        code === "email_exists" ||
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("exists");

      if (!alreadyExists) {
        return new Response(
          JSON.stringify({
            error: "Erro ao criar usuário",
            status: createRes.status,
            details: createText.slice(0, 500),
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("[instant-login] User already exists, proceeding");
    } else {
      console.log("[instant-login] User created");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });


    // Generate a token_hash (no email sent, no redirect)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError) {
      console.error("[instant-login] generateLink error:", linkError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar acesso", details: linkError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token_hash = (linkData as any)?.properties?.hashed_token;
    if (!token_hash) {
      return new Response(
        JSON.stringify({ error: "Token não gerado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[instant-login] token_hash generated");

    return new Response(
      JSON.stringify({ token_hash, email }),
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
