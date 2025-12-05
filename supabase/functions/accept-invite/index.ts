import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && email.length <= 255 && emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

function isValidToken(token: string): boolean {
  // Token should be alphanumeric, reasonable length
  return typeof token === 'string' && token.length >= 8 && token.length <= 256 && /^[a-zA-Z0-9_-]+$/.test(token);
}

function sanitizeString(str: string, maxLength: number): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
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
    // Parse JSON body safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate input types
    if (typeof body !== 'object' || body === null) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const rawBody = body as Record<string, unknown>;
    const email = typeof rawBody.email === 'string' ? rawBody.email.trim().toLowerCase() : '';
    const password = typeof rawBody.password === 'string' ? rawBody.password : '';
    const token = typeof rawBody.token === 'string' ? rawBody.token.trim() : '';
    const dj_name = typeof rawBody.dj_name === 'string' ? sanitizeString(rawBody.dj_name, 100) : '';

    // Validate required fields
    if (!email || !password || !token) {
      return new Response(JSON.stringify({ error: "email, password e token são obrigatórios" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate password
    if (!isValidPassword(password)) {
      return new Response(JSON.stringify({ error: "Senha deve ter entre 8 e 128 caracteres" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate token format
    if (!isValidToken(token)) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
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
    const username = dj_name || email.split("@")[0];
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { dj_name: username },
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
      try {
        await supabase
          .from("profiles")
          .upsert({ id: userId, username });
      } catch {
        // Ignore profile errors
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("accept-invite error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});