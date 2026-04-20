'use client';

import { useState } from 'react';
import { Layout, Typography, Drawer, Button } from 'antd';
import {
  RobotOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { getUICopyFromLanguage } from '@/lib/ui-copy';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

import ChatWindow from '@/components/Chat/ChatWindow';
import RiasecRadarChart from '@/components/Dashboard/RadarChart';

export default function Home() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const uiCopy = getUICopyFromLanguage(
    typeof window === 'undefined' ? undefined : window.navigator.language
  );

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* ── Panel Izquierdo: Chat (100% en móvil, 65% en escritorio) ── */}
      <Content
        className="w-full lg:w-[65%] lg:flex-none flex-1"
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Header del Chat */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RobotOutlined style={{ fontSize: 20, color: 'var(--primary)' }} />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, color: 'var(--foreground)' }}>
                VocatAI
              </Title>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {uiCopy.home.appSubtitle}
              </Text>
            </div>
          </div>

          {/* Botón Móvil para abrir el Radar */}
          <Button 
            className="lg:hidden flex items-center justify-center"
            type="primary"
            shape="round"
            icon={<RadarChartOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ fontWeight: 500 }}
          >
            {uiCopy.home.mobileProfileButton}
          </Button>
        </div>

        {/* ── Componente de Chat Real ── */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatWindow />
        </div>
      </Content>

      {/* ── Panel Derecho: Dashboard (Oculto en móvil, 35% en escritorio) ── */}
      <Sider
        width="35%"
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        style={{
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          overflow: 'auto',
        }}
        className="hidden lg:block"
      >
        {/* Header del Dashboard */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(0, 206, 209, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RadarChartOutlined style={{ fontSize: 20, color: '#00CED1' }} />
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

        {/* ── Componente de Radar (Escritorio) ── */}
        <div style={{ padding: 24 }}>
          <div
            style={{
              background: 'var(--surface-elevated)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 350,
              border: '1px solid var(--border)',
            }}
          >
            <RiasecRadarChart />
            <Text style={{ color: 'var(--text-secondary)', marginTop: 0, fontSize: 13, textAlign: 'center' }}>
              {uiCopy.home.radarHintDesktop}
            </Text>
          </div>
        </div>
      </Sider>

      {/* ── Drawer Móvil (Bottom Sheet) ── */}
      <Drawer
        title={<span style={{ color: 'var(--foreground)' }}>{uiCopy.home.drawerTitle}</span>}
        placement="bottom"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose={true}
        className="lg:hidden"
        styles={{ 
          body: { padding: '24px 16px', background: 'var(--surface)', overscrollBehavior: 'contain' },
          header: { background: 'var(--background)', borderBottom: '1px solid var(--border)' }
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
