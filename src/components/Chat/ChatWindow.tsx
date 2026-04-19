'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, Button, Skeleton, Typography, Avatar, Progress } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import {
  chatRequestInputSchema,
  chatResponseSchema,
  type ChatRequestInput,
} from '@/lib/chat-contract';
import { useVocational } from '@/context/VocationalContext';
import type { ChatResponse } from '@/types/chat';
import TestResults from '@/components/Dashboard/TestResults';

const { Text } = Typography;

const LOADING_MESSAGES = [
  'Analizando tus talentos...',
  'Sincronizando intereses...',
  'Calculando perfil RIASEC...',
  'Descubriendo tu vocación...'
];

const REQUEST_ERROR_MESSAGE = 'Ocurrió un error de conexión. Por favor reintenta.';

function parseRequestPayload(body: BodyInit | null | undefined): ChatRequestInput | null {
  if (typeof body !== 'string') return null;

  try {
    const parsedJson = JSON.parse(body);
    const parsedPayload = chatRequestInputSchema.safeParse(parsedJson);

    return parsedPayload.success ? parsedPayload.data : null;
  } catch {
    return null;
  }
}

function createTextResponseFromJson(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function requestNonStreamingFallback(payload: ChatRequestInput): Promise<ChatResponse | null> {
  try {
    const fallbackResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!fallbackResponse.ok) return null;

    const fallbackJson = await fallbackResponse.json();
    const parsedFallback = chatResponseSchema.safeParse(fallbackJson);

    return parsedFallback.success ? (parsedFallback.data as ChatResponse) : null;
  } catch {
    return null;
  }
}

export default function ChatWindow() {
  const { state, dispatch } = useVocational();
  const [inputValue, setInputValue] = useState('');
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);
  const [uiError, setUiError] = useState<string | null>(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPayloadRef = useRef<ChatRequestInput | null>(null);

  const MAX_QUESTIONS = 15;
  const progressPercent = Math.min(100, Math.max(0, (state.currentQuestion / MAX_QUESTIONS) * 100));

  const fetchWithFallback: typeof fetch = async (input, init) => {
    let streamResponse: Response | null = null;

    try {
      streamResponse = await fetch(input, init);

      if (streamResponse.ok && streamResponse.body) {
        return streamResponse;
      }
    } catch {
      streamResponse = null;
    }

    const payload = parseRequestPayload(init?.body);
    if (!payload) {
      if (streamResponse) return streamResponse;

      throw new Error(REQUEST_ERROR_MESSAGE);
    }

    const fallbackObject = await requestNonStreamingFallback(payload);

    if (fallbackObject) {
      return createTextResponseFromJson(fallbackObject);
    }

    if (streamResponse) return streamResponse;

    throw new Error(REQUEST_ERROR_MESSAGE);
  };

  // Hook del Vercel AI SDK para streaming progresivo de JSON (Objetos)
  const { object, submit, isLoading, error } = useObject({
    api: '/api/chat/stream',
    schema: chatResponseSchema,
    fetch: fetchWithFallback,
    onError: () => {
      setUiError(REQUEST_ERROR_MESSAGE);
    },
    onFinish: async ({ object: finalObject, error: err }) => {
      if (finalObject && !err) {
        dispatch({
          type: 'ADD_AI_RESPONSE',
          payload: { response: finalObject as ChatResponse },
        });

        setUiError(null);
        return;
      }

      const payload = lastPayloadRef.current;
      if (!payload) {
        setUiError(REQUEST_ERROR_MESSAGE);
        return;
      }

      setIsFallbackLoading(true);
      const fallbackResponse = await requestNonStreamingFallback(payload);
      setIsFallbackLoading(false);

      if (fallbackResponse) {
        dispatch({
          type: 'ADD_AI_RESPONSE',
          payload: { response: fallbackResponse },
        });

        setUiError(null);
        return;
      }

      setUiError(REQUEST_ERROR_MESSAGE);
    },
  });

  const isRequestLoading = isLoading || isFallbackLoading;

  // Auto-scroll al fondo cuando hay nuevos mensajes o cambia el streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, object, isRequestLoading]);

  // Rotar mensajes de carga (Gamificación)
  useEffect(() => {
    if (!isRequestLoading) return;
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isRequestLoading]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isRequestLoading) return;

    setUiError(null);

    const payload: ChatRequestInput = {
      message: trimmed,
      history: state.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      currentQuestion: state.currentQuestion,
    };

    lastPayloadRef.current = payload;

    // 1. Agregar el mensaje del usuario al contexto global
    dispatch({ type: 'ADD_USER_MESSAGE', payload: { content: trimmed } });

    // 2. Enviar el objeto de la petición a la API
    submit(payload);

    setInputValue('');
  };

  // Combinar el historial consolidado con el objeto JSON que se está streameando ahora
  const displayItems = [...state.messages];
  
  // Si estamos cargando y hay fragmentos del objeto stromeando, mostramos la previsualización del chat
  if (isRequestLoading) {
    displayItems.push({
      id: 'streaming-assistant',
      role: 'assistant',
      content: object?.dialogo_ia || '',
      timestamp: 0,
      aiResponse: object as ChatResponse,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* ── Barra de Progreso ── */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Progreso del Descubrimiento Vocacional
          </Text>
          <Text style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
            {Math.min(state.currentQuestion, MAX_QUESTIONS)} / {MAX_QUESTIONS}
          </Text>
        </div>
        <Progress 
          percent={progressPercent} 
          showInfo={false} 
          strokeColor={{
            '0%': 'var(--primary-glow)',
            '100%': 'var(--primary)',
          }}
          railColor="var(--surface-elevated)"
          size="small"
          status={state.isTestFinished ? "success" : "active"}
        />
      </div>

      {/* ── Área de Mensajes (con List de Ant Design) ── */}
      <div 
        className="chat-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '24px' }}
      >
        {displayItems.length === 0 ? (
          // Estado Vacío Inicial
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6, gap: 16 }}>
            <RobotOutlined style={{ fontSize: 48, color: 'var(--primary)' }} />
            <Text style={{ color: 'var(--foreground)', fontSize: 16 }}>¡Hola! Soy VocatAI</Text>
            <Text style={{ color: 'var(--text-secondary)' }}>Tu asistente de orientación vocacional. Escríbeme para comenzar.</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {displayItems.map((msg) => {
              const isUser = msg.role === 'user';
              // Mientras está cargando y es el mensaje strimeado sin texto todavía, mostramos Skeleton
              const isTyping = isRequestLoading && !msg.content && msg.id === 'streaming-assistant';

              return (
                <div key={msg.id} style={{ display: 'flex', gap: 16, width: '100%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                  
                  {/* AVATAR */}
                  <Avatar 
                    icon={isUser ? <UserOutlined /> : <RobotOutlined />} 
                    style={{ 
                      backgroundColor: isUser ? '#2d2d3a' : 'var(--primary-glow)',
                      color: isUser ? '#fff' : 'var(--primary)',
                      flexShrink: 0
                    }} 
                  />

                  {/* BURBUJA DE MENSAJE */}
                  <div style={{ 
                    maxWidth: '75%', 
                    background: isUser ? 'var(--primary-glow)' : 'var(--surface-elevated)',
                    padding: '12px 16px',
                    borderRadius: 16,
                    borderTopRightRadius: isUser ? 4 : 16,
                    borderTopLeftRadius: !isUser ? 4 : 16,
                    border: isUser ? '1px solid rgba(108, 92, 231, 0.3)' : '1px solid var(--border)'
                  }}>
                    {isTyping ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 250 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{loadingText}</Text>
                        <Skeleton active paragraph={{ rows: 1, width: ['100%'] }} title={false} />
                      </div>
                    ) : (
                      <Text style={{ color: 'var(--foreground)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {msg.content}
                      </Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Placeholder para error */}
        {(uiError || error) && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="danger">{uiError || REQUEST_ERROR_MESSAGE}</Text>
          </div>
        )}

        {/* ── Componente Final (Sugerencias RIASEC) ── */}
        {state.isTestFinished && (
          <div style={{ marginTop: 24 }}>
            <TestResults />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Barra de Input Fija en el Layout ── */}
      <div style={{ 
        paddingTop: 16, 
        paddingLeft: 24, 
        paddingRight: 24, 
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--border)', 
        background: 'var(--surface)' 
      }}>
        {state.isTestFinished ? (
          <div style={{ textAlign: 'center', padding: '8px 0', background: 'var(--surface-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <Text style={{ color: 'var(--primary)', fontWeight: 600 }}>🌟 Test Vocacional Finalizado</Text>
            <br />
            <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Revisa tus resultados en la parte superior o en el Radar.</Text>
          </div>
        ) : (
          <Input
            size="large"
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            disabled={isRequestLoading || state.isTestFinished}
            style={{ 
              background: 'var(--surface-elevated)', 
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              borderRadius: 12
            }}
            suffix={
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSend}
                loading={isRequestLoading}
                disabled={state.isTestFinished}
                style={{ background: 'var(--primary)', border: 'none', borderRadius: 8 }}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
