'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Input, Button, Skeleton, Typography, Avatar, Progress } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import {
  chatRequestInputSchema,
  chatResponseSchema,
  type ChatRequestInput,
} from '@/lib/chat-contract';
import {
  getChatUICopy,
  resolveChatLocale,
} from '@/lib/chat-ui';
import { useVocational } from '@/context/VocationalContext';
import type { ChatResponse } from '@/types/chat';
import TestResults from '@/components/Dashboard/TestResults';
import { useTheme } from '@/context/ThemeContext';

const { Text } = Typography;

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
  const locale = useMemo(
    () => resolveChatLocale(typeof window === 'undefined' ? undefined : window.navigator.language),
    []
  );
  const uiCopy = useMemo(() => getChatUICopy(locale), [locale]);

  const { state, dispatch } = useVocational();
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [loadingText, setLoadingText] = useState(uiCopy.loadingMessages[0]);
  const [uiError, setUiError] = useState<string | null>(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPayloadRef = useRef<ChatRequestInput | null>(null);

  const MAX_QUESTIONS = 15;
  const progressPercent = Math.min(100, Math.max(0, (state.currentQuestion / MAX_QUESTIONS) * 100));
  const progressLabel = `${Math.round(progressPercent)}%`;

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

      throw new Error(uiCopy.requestErrorMessage);
    }

    const fallbackObject = await requestNonStreamingFallback(payload);

    if (fallbackObject) {
      return createTextResponseFromJson(fallbackObject);
    }

    if (streamResponse) return streamResponse;

    throw new Error(uiCopy.requestErrorMessage);
  };

  // Hook del Vercel AI SDK para streaming progresivo de JSON (Objetos)
  const { object, submit, isLoading, error } = useObject({
    api: '/api/chat/stream',
    schema: chatResponseSchema,
    fetch: fetchWithFallback,
    onError: () => {
      setUiError(uiCopy.requestErrorMessage);
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
        setUiError(uiCopy.requestErrorMessage);
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

      setUiError(uiCopy.requestErrorMessage);
    },
  });

  const isRequestLoading = isLoading || isFallbackLoading;
  const isDarkTheme = theme === 'dark';

  // Auto-scroll al fondo cuando hay nuevos mensajes o cambia el streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, object, isRequestLoading]);

  // Rotar mensajes de carga (Gamificación)
  useEffect(() => {
    if (!isRequestLoading) return;
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        const currentIndex = uiCopy.loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % uiCopy.loadingMessages.length;
        return uiCopy.loadingMessages[nextIndex];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isRequestLoading, uiCopy.loadingMessages]);

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
    <div
      id="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--background-soft)',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {uiCopy.progressTitle}
          </Text>
          <Text style={{ fontSize: 13, color: 'var(--primary-strong)', fontWeight: 700 }}>
            {progressLabel}
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
          status={state.isTestFinished ? 'success' : 'active'}
        />
      </div>

      <div
        className="chat-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px clamp(14px, 3.5vw, 24px)',
          overscrollBehavior: 'contain',
        }}
      >
        {displayItems.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              opacity: 0.85,
              gap: 14,
              textAlign: 'center',
            }}
          >
            <RobotOutlined style={{ fontSize: 46, color: 'var(--primary)' }} />
            <Text style={{ color: 'var(--foreground)', fontSize: 16 }}>{uiCopy.emptyStateTitle}</Text>
            <Text style={{ color: 'var(--text-secondary)' }}>{uiCopy.emptyStateDescription}</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayItems.map((msg) => {
              const isUser = msg.role === 'user';
              const isTyping = isRequestLoading && !msg.content && msg.id === 'streaming-assistant';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    width: '100%',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    animation: 'fade-slide-in 220ms ease-out',
                  }}
                >
                  <Avatar
                    icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: isUser ? 'var(--surface-elevated)' : 'var(--primary-glow)',
                      color: isUser ? 'var(--foreground)' : 'var(--primary)',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  />

                  <div
                    style={{
                      maxWidth: 'min(82%, 760px)',
                      background: isUser
                        ? 'color-mix(in srgb, var(--primary-glow) 80%, var(--surface))'
                        : 'var(--surface)',
                      padding: '12px 16px',
                      borderRadius: 16,
                      borderTopRightRadius: isUser ? 6 : 16,
                      borderTopLeftRadius: !isUser ? 6 : 16,
                      border: isUser
                        ? '1px solid color-mix(in srgb, var(--primary) 26%, var(--border))'
                        : '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
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

        {(uiError || error) && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              textAlign: 'center',
              marginTop: 16,
              padding: '10px 12px',
              border: '1px solid color-mix(in srgb, var(--danger) 35%, var(--border))',
              borderRadius: 12,
              background: 'color-mix(in srgb, var(--danger) 9%, var(--surface))',
            }}
          >
            <Text style={{ color: 'var(--danger)' }}>{uiError || uiCopy.requestErrorMessage}</Text>
          </div>
        )}

        {state.isTestFinished && (
          <div style={{ marginTop: 24 }}>
            <TestResults />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          paddingTop: 14,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        {state.isTestFinished ? (
          <div
            style={{
              textAlign: 'center',
              padding: '10px 12px',
              background: 'var(--surface-elevated)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <Text style={{ color: 'var(--primary-strong)', fontWeight: 700 }}>{uiCopy.finishedTitle}</Text>
            <br />
            <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{uiCopy.finishedDescription}</Text>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <Input
              size="large"
              aria-label={uiCopy.inputPlaceholder}
              placeholder={uiCopy.inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              disabled={isRequestLoading || state.isTestFinished}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                borderRadius: 12,
              }}
            />
            <Button
              type="primary"
              aria-label={uiCopy.sendButtonLabel}
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={isRequestLoading}
              disabled={state.isTestFinished}
              style={{
                minWidth: 48,
                minHeight: 46,
                borderRadius: 12,
                boxShadow: isDarkTheme ? 'none' : '0 8px 18px rgba(47, 111, 237, 0.28)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
