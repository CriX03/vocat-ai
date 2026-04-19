'use client';

import { ConfigProvider, theme } from 'antd';
import esES from 'antd/locale/es_ES';

interface AntdProviderProps {
  children: React.ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6C5CE7',
          colorBgContainer: '#16161a',
          colorBgLayout: '#0d0d10',
          colorBgElevated: '#1e1e24',
          colorText: '#e2e2e8',
          colorTextSecondary: '#94949e',
          borderRadius: 12,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        },
        components: {
          Layout: {
            siderBg: '#12121a',
            headerBg: '#16161a',
            bodyBg: '#0d0d10',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
