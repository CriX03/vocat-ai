'use client';

import { Result, Button, Typography, Tag, Space } from 'antd';
import { RedoOutlined, TrophyOutlined } from '@ant-design/icons';
import { useVocational } from '@/context/VocationalContext';
import { riasecDictionary } from '@/lib/riasec-dictionary';
import type { RiasecCategory } from '@/types/chat';

const { Text, Paragraph, Title } = Typography;

export default function TestResults() {
  const { state, dispatch } = useVocational();
  const { riasecScores } = state;

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
        title="Sin perfil definido"
        subTitle="El test ha finalizado pero no se detectó un perfil RIASEC claro. Intenta dar respuestas más detalladas en la próxima sesión."
        extra={
          <Button type="primary" onClick={handleRestart} icon={<RedoOutlined />}>
            Reiniciar Test
          </Button>
        }
      />
    );
  }

  const primaryProfile = riasecDictionary[primary[0]];
  const secondaryProfile = secondary ? riasecDictionary[secondary[0]] : null;
  const primaryCareerDetails = primaryProfile.careerDetails.slice(0, 3);
  const secondaryCareerDetails = secondaryProfile?.careerDetails.slice(0, 2) ?? [];

  return (
    <div style={{ padding: '0 24px 24px' }}>
      <Result
        icon={<TrophyOutlined style={{ color: 'var(--primary)' }} />}
        status="success"
        title={
          <Title level={3} style={{ color: 'var(--foreground)' }}>
            ¡Perfil Vocacional Encontrado!
          </Title>
        }
        subTitle={
          <Text style={{ color: 'var(--text-secondary)' }}>
            Basado en tus respuestas, este es tu perfil dominante.
          </Text>
        }
        style={{ padding: '32px 0 16px' }}
        extra={[
          <Button key="restart" type="primary" onClick={handleRestart} icon={<RedoOutlined />}>
            Reiniciar y probar de nuevo
          </Button>,
        ]}
      >
        <div style={{ background: 'var(--surface-elevated)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'left' }}>
          
          <Paragraph>
            <Text style={{ fontSize: 16, color: 'var(--foreground)' }}>
              Tu perfil dominante es: <strong style={{ color: 'var(--primary)' }}>{primaryProfile.title}</strong>
            </Text>
          </Paragraph>
          <Paragraph style={{ color: 'var(--text-secondary)' }}>
            {primaryProfile.description}
          </Paragraph>

          {primaryProfile.descriptions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ color: 'var(--foreground)', display: 'block', marginBottom: 8 }}>
                Rasgos clave de tu perfil:
              </Text>
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
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
              Top 3 Carreras Recomendadas (Principal):
            </Text>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {primaryCareerDetails.map((career) => (
                <div
                  key={career.name}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}
                >
                  <Tag color="cyan" style={{ padding: '4px 12px', fontSize: 14, borderRadius: 16, marginBottom: 8 }}>
                    {career.name}
                  </Tag>
                  <Text style={{ color: 'var(--text-secondary)', display: 'block', lineHeight: 1.6 }}>
                    {career.description}
                  </Text>
                </div>
              ))}
            </Space>
          </div>

          {secondary && secondaryProfile && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Perfil secundario influyente: <strong>{secondaryProfile.title}</strong>
              </Text>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {secondaryCareerDetails.map((career) => (
                  <div key={career.name}>
                    <Tag color="blue" style={{ borderRadius: 16, marginBottom: 6 }}>
                      {career.name}
                    </Tag>
                    <Text style={{ color: 'var(--text-secondary)', display: 'block', lineHeight: 1.6 }}>
                      {career.description}
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
