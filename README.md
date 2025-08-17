# RemiXense Pro 🎧

**Plataforma criativa para DJs e produtores musicais: criação, organização e colaboração com IA.**

![RemiXense Pro](https://img.shields.io/badge/version-1.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-production_ready-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

## 🚀 Principais Recursos

### 🎵 DJ Tools Profissionais
- **Dual Player**: Dois decks sincronizados com crossfader avançado
- **Mix Engine**: IA para sugestão de mixagens compatíveis
- **Análise de BPM/Key**: Detecção automática e sincronização
- **Cue Points & Loops**: Controles profissionais de DJ
- **Compatibility Engine**: Análise harmônica Camelot Wheel

### 📚 Gestão de Biblioteca
- **Track Library**: Organização completa de faixas
- **Metadata Manager**: Edição e enriquecimento de metadados
- **Smart Search**: Busca inteligente por compatibilidade
- **Export Tools**: Exportação para plataformas externas

### 🤖 Recursos de IA
- **Auto Mix**: Mixagem automática com IA
- **Harmony Analysis**: Análise harmônica avançada
- **Key Sync**: Sincronização automática de tons
- **BPM Matching**: Detecção e ajuste inteligente de BPM

### 🌐 Comunidade & Colaboração
- **Social Feed**: Compartilhamento de mixagens
- **Feedback Rooms**: Colaboração em tempo real
- **Remix Challenges**: Competições criativas
- **Marketplace**: Monetização de conteúdo

### 💎 Recursos Premium
- **Unlimited Uploads**: Upload ilimitado de faixas
- **Advanced Export**: Exportação em alta qualidade
- **Priority Processing**: Processamento prioritário
- **Community Access**: Acesso completo à comunidade

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Audio**: Web Audio API + Wavesurfer.js
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Payments**: Stripe Integration
- **PWA**: Service Worker + Manifest
- **Deploy**: Netlify/Vercel Ready

## 📦 Instalação & Setup

### Pré-requisitos
```bash
Node.js 18+ 
npm 8+ ou pnpm
```

### 1. Clone & Install
```bash
git clone <repo-url>
cd remixense-pro
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Configure as variáveis:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup
1. Clique no botão Supabase no topo direito
2. Conecte seu projeto Supabase
3. Execute as migrations automáticas

### 4. Development
```bash
npm run dev
# App disponível em http://localhost:5173
```

### 5. Production Build
```bash
npm run build
npm run preview
```

## 🎛️ Feature Flags

O RemiXense Pro utiliza feature flags para recursos experimentais:

```typescript
// src/lib/experimentalFeatures.ts
export const FEATURE_FLAGS = {
  AUDIO_EXPERIMENTAL: process.env.NODE_ENV === 'development',
  KEY_SYNC_AUTO: false,
  PITCH_SHIFT_REALTIME: false, 
  STEM_SEPARATION: false,
  AI_MIXING: false,
  ADVANCED_ANALYSIS: true,
}
```

### Habilitando Recursos Experimentais
```javascript
// Para development
AUDIO_EXPERIMENTAL: true

// Para produção - habilite apenas recursos estáveis
ADVANCED_ANALYSIS: true
```

**⚠️ Aviso**: Recursos experimentais podem afetar performance e estabilidade.

## 📱 PWA & Mobile

### Instalação Mobile
- **Android/Chrome**: Banner "Instalar app" ou Menu → "Adicionar à tela inicial"
- **iOS/Safari**: Botão Compartilhar → "Adicionar à Tela de Início"

### Offline Support
- Service Worker ativo em produção
- Cache de assets críticos
- Fallback para SPA offline

## 🧪 Testes

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Lighthouse CI
```bash
npm run build
npx lhci autorun
```

**Targets**: Performance ≥90, A11y ≥90, Best Practices ≥90, PWA ≥90

## 💳 Planos & Preços

### 🆓 Free
- 3 uploads máximo
- 100MB storage
- Recursos básicos

### 💎 Pro ($4.90/mês)
- Uploads ilimitados
- Export de qualidade
- Acesso à comunidade

### 🚀 Expert ($9.90/mês)
- Storage premium
- Marketplace completo
- Recursos avançados de IA

## 🔧 Troubleshooting

### Cache/SW Issues
```bash
# Limpar cache do browser
# Storage → Clear site data

# Force refresh
Ctrl+Shift+R (Chrome)
Cmd+Shift+R (Safari)
```

### Build Errors
```bash
# Lint check
npm run lint

# Type check
npm run type-check

# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### Audio Issues
- Verifique permissões de microfone
- Use HTTPS em produção
- Teste em navegadores compatíveis

## 📊 Analytics & Monitoring

### Performance Monitoring
- Lighthouse CI integrado
- Core Web Vitals tracking
- Error boundary reports

### Usage Analytics
```bash
# Ver analytics de produção
npm run analytics:view
```

## 🤝 Contributing

### Development Workflow
1. Fork o repositório
2. Crie feature branch: `git checkout -b feature/nome`
3. Commit mudanças: `git commit -m 'feat: descrição'`
4. Push branch: `git push origin feature/nome`
5. Abra Pull Request

### Code Standards
- ESLint + Prettier configurados
- TypeScript strict mode
- Semantic commit messages
- Component testing obrigatório

## 📄 License

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Support

- **Docs**: [Documentação Completa](./docs/)
- **Issues**: [GitHub Issues](../../issues)
- **Discord**: [Comunidade RemiXense](https://discord.gg/remixense)
- **Email**: support@remixense.com

---

**RemiXense Pro v1.0** - Criado com ❤️ para a comunidade DJ