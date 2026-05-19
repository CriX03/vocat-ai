'use client';

import { Result, Button, Typography, Tag, Space } from 'antd';
import { RedoOutlined, TrophyOutlined } from '@ant-design/icons';
import { useVocational } from '@/context/VocationalContext';
import { riasecDictionary } from '@/lib/riasec-dictionary';
import { buildFinalRecommendations } from '@/lib/final-recommendations';
import { getUICopyFromLanguage } from '@/lib/ui-copy';
import type { RiasecCategory } from '@/types/chat';

const { Text, Paragraph, Title } = Typography;

export default function TestResults() {
  const { state, dispatch } = useVocational();
  const { riasecScores } = state;
  const uiCopy = getUICopyFromLanguage(
    typeof window === 'undefined' ? undefined : window.navigator.language
  );

  // Determinar los 2 perfiles dominantes (los de mayor puntaje)
  const entries = Object.entries(riasecScores) as [Exclude<RiasecCategory, 'NONE'>, number][];
  
  // Ordenar de mayor a menor y filtrar los que tengan más de 0
  const sorted = entries
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const primary = sorted[0];
  const secondary = sorted[1]; // Puede no existir si solo puntuó en uno

  const handleRestart = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  if (!primary) {
    return (
      <Result
        status="warning"
        title={uiCopy.testResults.noProfileTitle}
        subTitle={uiCopy.testResults.noProfileSubtitle}
        extra={
          <Button type="primary" onClick={handleRestart} icon={<RedoOutlined />}>
            {uiCopy.testResults.restartButton}
          </Button>
        }
      />
    );
  }

  const primaryProfile = riasecDictionary[primary[0]];
  const secondaryProfile = secondary ? riasecDictionary[secondary[0]] : null;

  const allCareerDetails = Object.values(riasecDictionary).flatMap((profile) => profile.careerDetails);
  const chatResponses = state.messages
    .filter((message) => message.role === 'assistant')
    .map((message) => message.aiResponse)
    .filter((response): response is NonNullable<typeof response> => Boolean(response));

  const finalRecommendations = buildFinalRecommendations({
    primaryProfile: primary[0],
    primaryProfileTitle: primaryProfile.title,
    careers: allCareerDetails,
    riasecScores: state.riasecScores,
    vocationalDomains: state.vocationalDomains,
    chatResponses,
  });

  const primaryCareerRecommendations = finalRecommendations.carreras_recomendadas.slice(0, 3);
  const secondaryCareerRecommendations = finalRecommendations.carreras_recomendadas.slice(3, 5);

  return (
    <div style={{ padding: '0 12px 20px' }}>
      <Result
        icon={<TrophyOutlined style={{ color: 'var(--primary)' }} />}
        status="success"
        title={
          <Title level={3} style={{ color: 'var(--foreground)' }}>
            {uiCopy.testResults.profileFoundTitle}
          </Title>
        }
        subTitle={
          <Text style={{ color: 'var(--text-secondary)' }}>
            {uiCopy.testResults.profileFoundSubtitle}
          </Text>
        }
        style={{ padding: '18px 0 12px' }}
        extra={[
          <Button key="restart" type="primary" onClick={handleRestart} icon={<RedoOutlined />}>
            {uiCopy.testResults.restartAndTryAgainButton}
          </Button>,
        ]}
      >
        <div
          style={{
            background: 'var(--surface)',
            padding: 20,
            borderRadius: 16,
            border: '1px solid var(--border)',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Paragraph>
            <Text style={{ fontSize: 16, color: 'var(--foreground)' }}>
              {uiCopy.testResults.dominantProfileLabel}{' '}
              <strong style={{ color: 'var(--primary-strong)' }}>{primaryProfile.title}</strong>
            </Text>
          </Paragraph>
          <Paragraph style={{ color: 'var(--text-secondary)' }}>
            {finalRecommendations.justificacion_perfil}
          </Paragraph>

          {primaryProfile.descriptions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ color: 'var(--foreground)', display: 'block', marginBottom: 8 }}>
                {uiCopy.testResults.keyTraitsLabel}
              </Text>
              <Space orientation="vertical" size={6} style={{ width: '100%' }}>
                {primaryProfile.descriptions.slice(0, 2).map((item) => (
                  <Text key={item} style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    - {item}
                  </Text>
                ))}
              </Space>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <Text strong style={{ color: 'var(--foreground)', display: 'block', marginBottom: 12 }}>
              {uiCopy.testResults.topCareersLabel}
            </Text>
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              {primaryCareerRecommendations.map((career) => (
                <div
                  key={career.carrera}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-elevated)',
                  }}
                >
                  <Tag
                    color="blue"
                    style={{
                      padding: '4px 12px',
                      fontSize: 14,
                      borderRadius: 16,
                      marginBottom: 8,
                      border: 'none',
                    }}
                  >
                    {career.carrera}
                  </Tag>
                  <Text style={{ color: 'var(--text-secondary)', display: 'block', lineHeight: 1.6 }}>
                    {career.razon}
                  </Text>
                </div>
              ))}
            </Space>
          </div>

          {secondary && secondaryProfile && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                {uiCopy.testResults.secondaryProfileLabel}{' '}
                <strong>{secondaryProfile.title}</strong>
              </Text>
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                {secondaryCareerRecommendations.map((career) => (
                  <div key={career.carrera} style={{ padding: 10, borderRadius: 12, background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                    <Tag color="geekblue" style={{ borderRadius: 16, marginBottom: 6, border: 'none' }}>
                      {career.carrera}
                    </Tag>
                    <Text style={{ color: 'var(--text-secondary)', display: 'block', lineHeight: 1.6 }}>
                      {career.razon}
                    </Text>
                  </div>
                ))}
              </Space>
            </div>
          )}

        </div>
      </Result>
    </div>
  );
}
