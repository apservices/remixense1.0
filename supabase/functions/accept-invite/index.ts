import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  email?: string;
  password?: string;
  token?: string;
  dj_name?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body: Payload = await req.json().catch(() => ({}));
    const { email, password, token, dj_name } = body;

    if (!email || !password || !token) {
      return new Response(JSON.stringify({ error: "email, password e token são obrigatórios" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1) Buscar convite válido
    const { data: invite, error: inviteErr } = await supabase
      .from("invites")
      .select("id, email, token, expires_at, used_at, plan_type")
      .eq("token", token)
      .eq("email", email)
      .maybeSingle();

    if (inviteErr) throw inviteErr;
    if (!invite) {
      return new Response(JSON.stringify({ error: "Convite não encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (invite.used_at) {
      return new Response(JSON.stringify({ error: "Convite já utilizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Convite expirado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 2) Criar usuário via admin (self-signup pode estar desativado)
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { dj_name: dj_name || email.split("@")[0] },
    });

    if (createErr) {
      // Se já existe, seguimos para completar o fluxo
      if (createErr.message && !/already exists/i.test(createErr.message)) {
        return new Response(JSON.stringify({ error: createErr.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    const userId = created?.user?.id;

    // 3) Marcar convite como usado
    const { error: usedErr } = await supabase
      .from("invites")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invite.id);
    if (usedErr) throw usedErr;

    // 4) Garantir perfil básico
    if (userId) {
      await supabase
        .from("profiles")
        .upsert({ id: userId, username: dj_name || email.split("@")[0] })
        .then(() => {})
        .catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
