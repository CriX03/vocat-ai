'use client';

import dynamic from 'next/dynamic';
import { useVocational } from '@/context/VocationalContext';
import { Spin } from 'antd';

// Importación dinámica obligatoria para evitar errores de "document is not defined" (SSR)
// ya que ant-design/plots / G2 usa Canvas/DOM por debajo.
const Radar = dynamic(() => import('@ant-design/plots').then((mod) => mod.Radar), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
});

export default function RiasecRadarChart() {
  const { state } = useVocational();
  const { riasecScores } = state;

  const data = [
    { category: 'Realista', score: riasecScores.R },
    { category: 'Investigador', score: riasecScores.I },
    { category: 'Artístico', score: riasecScores.A },
    { category: 'Social', score: riasecScores.S },
    { category: 'Emprendedor', score: riasecScores.E },
    { category: 'Convencional', score: riasecScores.C },
  ];

  // Identificar si el test acaba de empezar (todo en cero)
  const isAllZero = Object.values(riasecScores).every((score) => score === 0);

  // Escala máxima dinámica (mínimo 10, va creciendo)
  const currentMax = Math.max(...Object.values(riasecScores));
  const maxDomain = Math.max(10, currentMax + 5);

  const config = {
    data,
    autoFit: true,
    xField: 'category',
    yField: 'score',
    meta: {
      score: {
        alias: 'Puntos RIASEC',
        min: 0,
        max: maxDomain,
      },
    },
    // Estilos premium adaptados al Dark Theme (variables CSS)
    area: {
      style: {
        fillOpacity: 0.25,
        fill: '#6c5ce7', // var(--primary)
      },
    },
    line: {
      style: {
        stroke: '#6c5ce7',
        lineWidth: 2,
      },
    },
    point: {
      size: 4,
      shapeField: 'circle',
      style: {
        fill: '#6c5ce7',
        stroke: '#2d2d3a', // fondo
        lineWidth: 2,
      },
    },
    axis: {
      y: {
        grid: {
          line: {
            style: {
              stroke: 'rgba(255, 255, 255, 0.1)',
              lineDash: [4, 4],
            },
          },
        },
        label: false,
      },
      x: {
        label: {
          style: {
            fill: 'rgba(255, 255, 255, 0.65)',
            fontSize: 12,
          },
        },
      },
    },
    theme: 'dark', // Pide a G2 que empiece en base oscura
  };

  return (
    <div style={{ width: '100%', height: 320, opacity: isAllZero ? 0.3 : 1, transition: 'opacity 0.5s ease' }}>
      <Radar {...config} />
    </div>
  );
}
