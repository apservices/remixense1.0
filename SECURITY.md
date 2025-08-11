# Security

- Content Security Policy (CSP) configurada para reduzir superfícies de ataque.
- Funções Edge usam chaves de serviço do Supabase no ambiente seguro (nunca no client).
- RLS ativado em tabelas sensíveis (tracks, track_cues, track_loops, track_features).
- PWA com atualizações controladas; rotas críticas sem cache.
