'use client';

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { ChatResponse, RiasecCategory } from '@/types/chat';
import type { VocationalDomains } from '@/types/vocational-domain';

/* ────────────────────────────────────────────
 * Tipos del Estado
 * ──────────────────────────────────────────── */

/** Mensaje individual en el historial */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** Respuesta estructurada de la IA (solo para role === 'assistant') */
  aiResponse?: ChatResponse;
}

/** Puntaje acumulado RIASEC — el frontend es la única fuente de verdad */
export interface RiasecScores {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

/** Estado global de la sesión vocacional */
export interface VocationalState {
  messages: ChatMessage[];
  riasecScores: RiasecScores;
  vocationalDomains?: VocationalDomains;
  currentQuestion: number;
  isTestFinished: boolean;
  isLoading: boolean;
}

/* ────────────────────────────────────────────
 * Acciones del Reducer
 * ──────────────────────────────────────────── */

type VocationalAction =
  | { type: 'ADD_USER_MESSAGE'; payload: { content: string } }
  | { type: 'ADD_AI_RESPONSE'; payload: { response: ChatResponse } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_SESSION' };

/* ────────────────────────────────────────────
 * Estado Inicial
 * ──────────────────────────────────────────── */

const initialScores: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

const initialState: VocationalState = {
  messages: [],
  riasecScores: { ...initialScores },
  currentQuestion: 0,
  isTestFinished: false,
  isLoading: false,
};

/* ────────────────────────────────────────────
 * Utilidades
 * ──────────────────────────────────────────── */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @jsdoc-weight Acumula puntos RIASEC sin sobrescribir el acumulado histórico.
 * La IA sugiere los puntos, pero este reducer es el ÚNICO que los suma,
 * evitando alucinaciones de "memoria de pez" del modelo (protocolo §C).
 */
function accumulateRiasecScore(
  currentScores: RiasecScores,
  category: RiasecCategory,
  points: number
): RiasecScores {
  if (category === 'NONE') return currentScores;

  return {
    ...currentScores,
    [category]: currentScores[category] + points,
  };
}

function mergeVocationalDomains(
  currentDomains: VocationalDomains | undefined,
  incomingDomains: VocationalDomains | undefined
): VocationalDomains | undefined {
  if (!incomingDomains) return currentDomains;

  const mergedDetectedDomains = Array.from(
    new Set([
      ...(currentDomains?.detectedDomains ?? []),
      ...(incomingDomains.detectedDomains ?? []),
    ])
  );

  return {
    dominantDomain: incomingDomains.dominantDomain ?? currentDomains?.dominantDomain ?? null,
    detectedDomains:
      mergedDetectedDomains.length > 0 ? mergedDetectedDomains : currentDomains?.detectedDomains,
    scores: {
      ...(currentDomains?.scores ?? {}),
      ...(incomingDomains.scores ?? {}),
    },
  };
}

/* ────────────────────────────────────────────
 * Reducer
 * ──────────────────────────────────────────── */

function vocationalReducer(
  state: VocationalState,
  action: VocationalAction
): VocationalState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE': {
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: action.payload.content,
        timestamp: Date.now(),
      };

      return {
        ...state,
        messages: [...state.messages, userMessage],
      };
    }

    case 'ADD_AI_RESPONSE': {
      const { response } = action.payload;

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.dialogo_ia,
        timestamp: Date.now(),
        aiResponse: response,
      };

      return {
        ...state,
        messages: [...state.messages, aiMessage],
        riasecScores: accumulateRiasecScore(
          state.riasecScores,
          response.analisis_riasec.categoria,
          response.analisis_riasec.puntos
        ),
        currentQuestion: response.metadatos.pregunta_n,
        vocationalDomains: mergeVocationalDomains(
          state.vocationalDomains,
          response.vocationalDomains
        ),
        isTestFinished: response.metadatos.finalizar_test || response.metadatos.pregunta_n >= 15,
        isLoading: false,
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'RESET_SESSION':
      return { ...initialState };

    default:
      return state;
  }
}

/* ────────────────────────────────────────────
 * Context
 * ──────────────────────────────────────────── */

interface VocationalContextValue {
  state: VocationalState;
  dispatch: Dispatch<VocationalAction>;
}

const VocationalContext = createContext<VocationalContextValue | null>(null);

/* ────────────────────────────────────────────
 * Provider
 * ──────────────────────────────────────────── */

interface VocationalProviderProps {
  children: ReactNode;
}

export function VocationalProvider({ children }: VocationalProviderProps) {
  const [state, dispatch] = useReducer(vocationalReducer, initialState);

  return (
    <VocationalContext.Provider value={{ state, dispatch }}>
      {children}
    </VocationalContext.Provider>
  );
}

/* ────────────────────────────────────────────
 * Hook
 * ──────────────────────────────────────────── */

export function useVocational(): VocationalContextValue {
  const context = useContext(VocationalContext);

  if (!context) {
    throw new Error(
      'useVocational debe usarse dentro de un <VocationalProvider>'
    );
  }

  return context;
}
