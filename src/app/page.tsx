'use client';

import { useState } from 'react';
import { Button, Drawer, Layout, Space, Typography } from 'antd';
import {
  BulbOutlined,
  MoonOutlined,
  RobotOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { getUICopyFromLanguage } from '@/lib/ui-copy';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;

import ChatWindow from '@/components/Chat/ChatWindow';
import RiasecRadarChart from '@/components/Dashboard/RadarChart';

export default function Home() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const uiCopy = getUICopyFromLanguage(
    typeof window === 'undefined' ? undefined : window.navigator.language
  );

  const isDarkTheme = theme === 'dark';
  const themeSwitchLabel = isDarkTheme
    ? uiCopy.home.darkThemeLabel
    : uiCopy.home.lightThemeLabel;

  return (
    <Layout style={{ height: '100dvh', overflow: 'hidden' }}>
      <a href="#main-content" className="skip-link">
        {uiCopy.home.skipToMainContent}
      </a>
      <Content
        className="w-full flex-1 lg:w-[64%] lg:flex-none"
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent)',
              }}
            >
              <RobotOutlined style={{ fontSize: 20, color: 'var(--primary)' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <Title level={5} style={{ margin: 0, color: 'var(--foreground)' }}>
                VocatAI
              </Title>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {uiCopy.home.appSubtitle}
              </Text>
            </div>
          </div>

          <Space size={8} style={{ flexShrink: 0 }}>
            <Button
              aria-label={uiCopy.home.toggleThemeAriaLabel}
              onClick={toggleTheme}
              shape="round"
              icon={isDarkTheme ? <MoonOutlined /> : <BulbOutlined />}
              style={{
                minWidth: 44,
                minHeight: 42,
                borderColor: 'var(--border)',
                background: 'var(--surface-elevated)',
                color: 'var(--foreground)',
              }}
            >
              <span className="hidden sm:inline" title={themeSwitchLabel}>{themeSwitchLabel}</span>
              <span className="sm:hidden">{uiCopy.home.toggleThemeButtonText}</span>
            </Button>

            <Button
              className="lg:hidden"
              type="primary"
              aria-label={uiCopy.home.mobileDrawerButtonAriaLabel}
              shape="round"
              icon={<RadarChartOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ minHeight: 42 }}
            >
              {uiCopy.home.mobileProfileButton}
            </Button>
          </Space>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatWindow />
        </div>
      </Content>

      <Sider
        width="36%"
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        style={{
          background: 'transparent',
          overflow: 'auto',
          padding: 16,
        }}
        className="hidden lg:block"
      >
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: 'var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RadarChartOutlined style={{ fontSize: 20, color: 'var(--primary)' }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: 'var(--foreground)' }}>
              {uiCopy.home.dashboardTitle}
            </Title>
            <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {uiCopy.home.dashboardSubtitle}
            </Text>
          </div>
        </div>

        <div
          style={{
            padding: 18,
            background: 'var(--surface)',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              background: 'var(--surface-elevated)',
              borderRadius: 16,
              padding: 'clamp(16px, 2vw, 24px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 350,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <RiasecRadarChart />
            <Text style={{ color: 'var(--text-secondary)', marginTop: 0, fontSize: 13, textAlign: 'center', maxWidth: 320 }}>
              {uiCopy.home.radarHintDesktop}
            </Text>
          </div>
        </div>
      </Sider>

      <Drawer
        title={<span style={{ color: 'var(--foreground)' }}>{uiCopy.home.drawerTitle}</span>}
        placement="bottom"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose={true}
        className="lg:hidden"
        styles={{
          body: {
            padding: '20px 16px max(16px, env(safe-area-inset-bottom))',
            background: 'var(--background-soft)',
            overscrollBehavior: 'contain',
          },
          header: {
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          },
        }}
      >
        {drawerVisible && (
          <div
            style={{
              background: 'var(--surface-elevated)',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <RiasecRadarChart />
            <Text style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 13, textAlign: 'center' }}>
              {uiCopy.home.radarHintMobile}
            </Text>
          </div>
        )}
      </Drawer>
    </Layout>
  );
}
