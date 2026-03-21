'use client';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/map/LiveMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: '0.1em' }}>
      INICIALIZANDO MAPA...
    </div>
  ),
});

export default function LiveMapPage() {
  return <LiveMap />;
}
