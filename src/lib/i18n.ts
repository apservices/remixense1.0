// V3 Multi-language support (PT/EN/ES)

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export const defaultLanguage: Language = 'pt-BR';

export const translations = {
  'pt-BR': {
    // Navigation
    nav: {
      home: 'Início',
      create: 'Criar',
      manage: 'Gerenciar',
      distribute: 'Distribuir',
      community: 'Comunidade',
      settings: 'Configurações',
      profile: 'Perfil',
      logout: 'Sair'
    },
    // Home
    home: {
      welcome: 'Bem-vindo ao RemiXense',
      subtitle: 'Plataforma de criação musical com IA',
      recentProjects: 'Projetos Recentes',
      quickAccess: 'Acesso Rápido',
      trending: 'Em Alta'
    },
    // Create
    create: {
      title: 'Estúdio de Criação',
      melody: 'Gerador de Melodia',
      harmony: 'Matriz de Harmonia',
      stems: 'Separação de Stems',
      mastering: 'Auto-Mastering IA',
      mood: 'Modo de Humor',
      suno: 'Suno AI Generator'
    },
    // Player
    player: {
      play: 'Tocar',
      pause: 'Pausar',
      next: 'Próxima',
      previous: 'Anterior',
      volume: 'Volume',
      shuffle: 'Aleatório',
      repeat: 'Repetir'
    },
    // Common
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      search: 'Buscar',
      filter: 'Filtrar',
      upload: 'Enviar',
      download: 'Baixar',
      share: 'Compartilhar'
    },
    // Features
    features: {
      voiceCommands: 'Comandos de Voz',
      aiGeneration: 'Geração IA',
      stemSeparation: 'Separação de Stems',
      nftLicensing: 'Licenciamento NFT'
    }
  },
  'en-US': {
    nav: {
      home: 'Home',
      create: 'Create',
      manage: 'Manage',
      distribute: 'Distribute',
      community: 'Community',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout'
    },
    home: {
      welcome: 'Welcome to RemiXense',
      subtitle: 'AI-powered music creation platform',
      recentProjects: 'Recent Projects',
      quickAccess: 'Quick Access',
      trending: 'Trending'
    },
    create: {
      title: 'Creation Studio',
      melody: 'Melody Generator',
      harmony: 'Harmony Matrix',
      stems: 'Stem Separation',
      mastering: 'AI Auto-Mastering',
      mood: 'Mood Mode',
      suno: 'Suno AI Generator'
    },
    player: {
      play: 'Play',
      pause: 'Pause',
      next: 'Next',
      previous: 'Previous',
      volume: 'Volume',
      shuffle: 'Shuffle',
      repeat: 'Repeat'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      upload: 'Upload',
      download: 'Download',
      share: 'Share'
    },
    features: {
      voiceCommands: 'Voice Commands',
      aiGeneration: 'AI Generation',
      stemSeparation: 'Stem Separation',
      nftLicensing: 'NFT Licensing'
    }
  },
  'es-ES': {
    nav: {
      home: 'Inicio',
      create: 'Crear',
      manage: 'Gestionar',
      distribute: 'Distribuir',
      community: 'Comunidad',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Salir'
    },
    home: {
      welcome: 'Bienvenido a RemiXense',
      subtitle: 'Plataforma de creación musical con IA',
      recentProjects: 'Proyectos Recientes',
      quickAccess: 'Acceso Rápido',
      trending: 'Tendencias'
    },
    create: {
      title: 'Estudio de Creación',
      melody: 'Generador de Melodía',
      harmony: 'Matriz de Armonía',
      stems: 'Separación de Stems',
      mastering: 'Auto-Mastering IA',
      mood: 'Modo de Humor',
      suno: 'Suno AI Generator'
    },
    player: {
      play: 'Reproducir',
      pause: 'Pausar',
      next: 'Siguiente',
      previous: 'Anterior',
      volume: 'Volumen',
      shuffle: 'Aleatorio',
      repeat: 'Repetir'
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      filter: 'Filtrar',
      upload: 'Subir',
      download: 'Descargar',
      share: 'Compartir'
    },
    features: {
      voiceCommands: 'Comandos de Voz',
      aiGeneration: 'Generación IA',
      stemSeparation: 'Separación de Stems',
      nftLicensing: 'Licenciamiento NFT'
    }
  }
} as const;

export type TranslationKey = keyof typeof translations['pt-BR'];

// Helper function to get translation
export function t(key: string, lang: Language = defaultLanguage): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Get browser language
export function getBrowserLanguage(): Language {
  const browserLang = navigator.language;
  
  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('es')) return 'es-ES';
  return 'en-US';
}
