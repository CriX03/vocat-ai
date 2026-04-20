export type UILocale = 'es' | 'en';
export type ChatLocale = UILocale;

interface ChatUICopy {
  loadingMessages: string[];
  requestErrorMessage: string;
  progressTitle: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  inputPlaceholder: string;
  finishedTitle: string;
  finishedDescription: string;
}

const CHAT_UI_COPY: Record<UILocale, ChatUICopy> = {
  es: {
    loadingMessages: [
      'Analizando tus talentos...',
      'Sincronizando intereses...',
      'Calculando perfil RIASEC...',
      'Descubriendo tu vocación...',
    ],
    requestErrorMessage: 'Ocurrió un error de conexión. Por favor reintenta.',
    progressTitle: 'Progreso del Descubrimiento Vocacional',
    emptyStateTitle: '¡Hola! Soy VocatAI',
    emptyStateDescription:
      'Tu asistente de orientación vocacional. Escríbeme para comenzar.',
    inputPlaceholder: 'Escribe tu mensaje...',
    finishedTitle: '🌟 Test Vocacional Finalizado',
    finishedDescription:
      'Revisa tus resultados en la parte superior o en el Radar.',
  },
  en: {
    loadingMessages: [
      'Analyzing your strengths...',
      'Syncing your interests...',
      'Calculating your RIASEC profile...',
      'Discovering your vocation...',
    ],
    requestErrorMessage: 'Connection error. Please try again.',
    progressTitle: 'Vocational Discovery Progress',
    emptyStateTitle: 'Hi! I am VocatAI',
    emptyStateDescription:
      'Your vocational guidance assistant. Send me a message to begin.',
    inputPlaceholder: 'Type your message...',
    finishedTitle: '🌟 Vocational Test Completed',
    finishedDescription:
      'Review your results above or on the radar panel.',
  },
};

export function resolveChatLocale(language: string | undefined): UILocale {
  if (!language) return 'es';

  return language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function getChatUICopy(locale: ChatLocale): ChatUICopy {
  return CHAT_UI_COPY[locale];
}
