import { getChatUICopy, resolveChatLocale, type UILocale } from '@/lib/chat-ui';

interface HomePageCopy {
  appSubtitle: string;
  mobileProfileButton: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  radarHintDesktop: string;
  drawerTitle: string;
  radarHintMobile: string;
}

interface TestResultsCopy {
  noProfileTitle: string;
  noProfileSubtitle: string;
  restartButton: string;
  profileFoundTitle: string;
  profileFoundSubtitle: string;
  restartAndTryAgainButton: string;
  dominantProfileLabel: string;
  keyTraitsLabel: string;
  topCareersLabel: string;
  secondaryProfileLabel: string;
}

interface RadarChartCopy {
  categories: {
    realista: string;
    investigador: string;
    artistico: string;
    social: string;
    emprendedor: string;
    convencional: string;
  };
  scoreAlias: string;
}

interface AppUICopy {
  layoutMetadataTitle: string;
  layoutMetadataDescription: string;
  chat: ReturnType<typeof getChatUICopy>;
  home: HomePageCopy;
  testResults: TestResultsCopy;
  radarChart: RadarChartCopy;
}

const UI_COPY: Record<UILocale, AppUICopy> = {
  es: {
    layoutMetadataTitle: 'VocatAI — Orientación Vocacional Inteligente',
    layoutMetadataDescription:
      'Plataforma híbrida de orientación vocacional impulsada por IA. Descubre tu perfil RIASEC de forma interactiva.',
    chat: getChatUICopy('es'),
    home: {
      appSubtitle: 'Orientación Vocacional Inteligente',
      mobileProfileButton: 'Mi Perfil',
      dashboardTitle: 'Perfil RIASEC',
      dashboardSubtitle: 'Tu progreso en tiempo real',
      radarHintDesktop: 'El gráfico crecerá a medida que respondas las preguntas',
      drawerTitle: 'Tu Perfil RIASEC',
      radarHintMobile: 'Tu perfil se actualiza en tiempo real',
    },
    testResults: {
      noProfileTitle: 'Sin perfil definido',
      noProfileSubtitle:
        'El test ha finalizado pero no se detectó un perfil RIASEC claro. Intenta dar respuestas más detalladas en la próxima sesión.',
      restartButton: 'Reiniciar Test',
      profileFoundTitle: '¡Perfil Vocacional Encontrado!',
      profileFoundSubtitle:
        'Basado en tus respuestas, este es tu perfil dominante.',
      restartAndTryAgainButton: 'Reiniciar y probar de nuevo',
      dominantProfileLabel: 'Tu perfil dominante es:',
      keyTraitsLabel: 'Rasgos clave de tu perfil:',
      topCareersLabel: 'Top 3 Carreras Recomendadas (Principal):',
      secondaryProfileLabel: 'Perfil secundario influyente:',
    },
    radarChart: {
      categories: {
        realista: 'Realista',
        investigador: 'Investigador',
        artistico: 'Artístico',
        social: 'Social',
        emprendedor: 'Emprendedor',
        convencional: 'Convencional',
      },
      scoreAlias: 'Puntos RIASEC',
    },
  },
  en: {
    layoutMetadataTitle: 'VocatAI — Intelligent Vocational Guidance',
    layoutMetadataDescription:
      'Hybrid AI-powered vocational guidance platform. Discover your RIASEC profile interactively.',
    chat: getChatUICopy('en'),
    home: {
      appSubtitle: 'Intelligent Vocational Guidance',
      mobileProfileButton: 'My Profile',
      dashboardTitle: 'RIASEC Profile',
      dashboardSubtitle: 'Your progress in real time',
      radarHintDesktop: 'The chart will grow as you answer the questions',
      drawerTitle: 'Your RIASEC Profile',
      radarHintMobile: 'Your profile updates in real time',
    },
    testResults: {
      noProfileTitle: 'No profile detected',
      noProfileSubtitle:
        'The test has finished, but no clear RIASEC profile was detected. Try giving more detailed answers in your next session.',
      restartButton: 'Restart Test',
      profileFoundTitle: 'Vocational Profile Found!',
      profileFoundSubtitle:
        'Based on your answers, this is your dominant profile.',
      restartAndTryAgainButton: 'Restart and try again',
      dominantProfileLabel: 'Your dominant profile is:',
      keyTraitsLabel: 'Key traits of your profile:',
      topCareersLabel: 'Top 3 Recommended Careers (Primary):',
      secondaryProfileLabel: 'Influential secondary profile:',
    },
    radarChart: {
      categories: {
        realista: 'Realistic',
        investigador: 'Investigative',
        artistico: 'Artistic',
        social: 'Social',
        emprendedor: 'Enterprising',
        convencional: 'Conventional',
      },
      scoreAlias: 'RIASEC Score',
    },
  },
};

export function getUICopyFromLanguage(language: string | undefined): AppUICopy {
  return UI_COPY[resolveChatLocale(language)];
}

export function getUICopy(locale: UILocale): AppUICopy {
  return UI_COPY[locale];
}
