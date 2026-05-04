'use client';

import dynamic from 'next/dynamic';
import { useVocational } from '@/context/VocationalContext';
import { getUICopyFromLanguage } from '@/lib/ui-copy';
import { Spin } from 'antd';
import { useTheme } from '@/context/ThemeContext';

// Importación dinámica obligatoria para evitar errores de "document is not defined" (SSR)
// ya que ant-design/plots / G2 usa Canvas/DOM por debajo.
const Radar = dynamic(() => import('@ant-design/plots').then((mod) => mod.Radar), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin /></div>
});

export default function RiasecRadarChart() {
  const { state } = useVocational();
  const { theme } = useTheme();
  const { riasecScores } = state;
  const uiCopy = getUICopyFromLanguage(
    typeof window === 'undefined' ? undefined : window.navigator.language
  );

  const data = [
    { category: uiCopy.radarChart.categories.realista, score: riasecScores.R },
    { category: uiCopy.radarChart.categories.investigador, score: riasecScores.I },
    { category: uiCopy.radarChart.categories.artistico, score: riasecScores.A },
    { category: uiCopy.radarChart.categories.social, score: riasecScores.S },
    { category: uiCopy.radarChart.categories.emprendedor, score: riasecScores.E },
    { category: uiCopy.radarChart.categories.convencional, score: riasecScores.C },
  ];

  // Identificar si el test acaba de empezar (todo en cero)
  const isAllZero = Object.values(riasecScores).every((score) => score === 0);

  // Escala máxima dinámica (mínimo 10, va creciendo)
  const currentMax = Math.max(...Object.values(riasecScores));
  const maxDomain = Math.max(10, currentMax + 5);
  const isDarkTheme = theme === 'dark';

  const config = {
    data,
    autoFit: true,
    xField: 'category',
    yField: 'score',
    meta: {
      score: {
        alias: uiCopy.radarChart.scoreAlias,
        min: 0,
        max: maxDomain,
      },
    },
    area: {
      style: {
        fillOpacity: isDarkTheme ? 0.3 : 0.22,
        fill: 'var(--primary)',
      },
    },
    line: {
      style: {
        stroke: 'var(--primary)',
        lineWidth: 2,
      },
    },
    point: {
      size: 4,
      shapeField: 'circle',
      style: {
        fill: 'var(--primary)',
        stroke: 'var(--surface)',
        lineWidth: 2,
      },
    },
    axis: {
      y: {
        grid: {
          line: {
            style: {
              stroke: 'var(--chart-grid)',
              lineDash: [4, 4],
            },
          },
        },
        label: false,
      },
      x: {
        label: {
          style: {
            fill: 'var(--chart-label)',
            fontSize: 12,
          },
        },
      },
    },
    theme: isDarkTheme ? 'dark' : 'light',
  };

  return (
    <div
      style={{ width: '100%', height: 320, opacity: isAllZero ? 0.3 : 1, transition: 'opacity 0.5s ease' }}
      role="img"
      aria-label={uiCopy.radarChart.scoreAlias}
    >
      <span className="sr-only">
        {`${uiCopy.radarChart.categories.realista}: ${riasecScores.R}. `}
        {`${uiCopy.radarChart.categories.investigador}: ${riasecScores.I}. `}
        {`${uiCopy.radarChart.categories.artistico}: ${riasecScores.A}. `}
        {`${uiCopy.radarChart.categories.social}: ${riasecScores.S}. `}
        {`${uiCopy.radarChart.categories.emprendedor}: ${riasecScores.E}. `}
        {`${uiCopy.radarChart.categories.convencional}: ${riasecScores.C}.`}
      </span>
      <Radar {...config} />
    </div>
  );
}
