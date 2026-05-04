'use client';

import { ConfigProvider, theme } from 'antd';
import esES from 'antd/locale/es_ES';
import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface AntdProviderProps {
  children: React.ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  const { theme: activeTheme } = useTheme();

  const isDark = activeTheme === 'dark';

  const antdTheme = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: 'var(--primary)',
        colorInfo: 'var(--primary)',
        colorSuccess: 'var(--success)',
        colorError: 'var(--danger)',
        colorBgContainer: 'var(--surface)',
        colorBgLayout: 'var(--background)',
        colorBgElevated: 'var(--surface-elevated)',
        colorBorder: 'var(--border)',
        colorText: 'var(--foreground)',
        colorTextSecondary: 'var(--text-secondary)',
        borderRadius: 14,
        borderRadiusLG: 18,
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      },
      components: {
        Layout: {
          siderBg: 'transparent',
          headerBg: 'transparent',
          bodyBg: 'transparent',
        },
        Button: {
          controlHeight: 42,
          fontWeight: 600,
        },
        Input: {
          controlHeightLG: 46,
        },
        Drawer: {
          colorBgElevated: 'var(--surface)',
        },
      },
    }),
    [isDark]
  );

  return (
    <ConfigProvider
      locale={esES}
      theme={antdTheme}
    >
      {children}
    </ConfigProvider>
  );
}
