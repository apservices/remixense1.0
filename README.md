# RemiXense 🎧

Plataforma criativa para DJs e produtores musicais: criação, organização e colaboração com IA.

## Principais Blocos
- Player com waveform e dual deck
- Análise de BPM/Key/energia
- Gestão de biblioteca e metadados
- Remix e manipulação de stems
- Comunidade e gamificação
- Distribuição e monetização

Veja também: [roadmap.md](./roadmap.md)

---

## Release – PWA & Qualidade

- PWA instalável (iOS/Android):
  - Manifest: name/short_name, start_url/scope "/", display "standalone", theme/background, ícones maskable 192/512.
  - iOS: meta apple-mobile-web-app-capable=yes, status-bar=black-translucent, title, apple-touch-icon 180.
  - Service Worker (produção): cache seguro (stale-while-revalidate) + fallback offline para SPA.
- Lighthouse CI (gate ≥ 90): Performance, A11y, Best Practices, PWA. Ver .lighthouserc.json + workflow lhci.
- SPA fallback: ver netlify.toml (/* → /index.html 200).
- Testes mínimos:
  - Install CTA (beforeinstallprompt / iOS A2HS)
  - Gate do SW (PROD) – tests/unit/register-sw-gate.test.ts
  - Fallback SPA – tests/integration/offline-navigation.test.ts

## Instalação do App

- Android/Chrome: Abra o site → banner “Instalar app” ou Menu ⋮ → "Adicionar à tela inicial".
- iOS/Safari: Botão Compartilhar → "Adicionar à Tela de Início". Se não ver, role a folha de ações.

## Troubleshooting de Cache/SW

- Forçar atualização: fechar todas as abas do app, limpar dados do site (Storage/Cache), reabrir.
- SW antigo: o SW atual faz cleanup de versões. Após publicar, aguarde até 24h para atualização automática.
- Em dev, o Service Worker não é registrado (apenas produção).

## Execução

- Dev: npm run dev
- Build: npm run build → dist/
- Testes: npm test

## Lighthouse CI

- Rodar localmente: npx lhci autorun --config=.lighthouserc.json (requer build prévio)
- CI falha se qualquer categoria < 0.90.
