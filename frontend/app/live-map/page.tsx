'use client';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(
  () => import('@/components/map/LiveMapDeckGL'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#080e1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#06B6D4',
        fontSize: '13px',
        fontFamily: 'monospace',
        letterSpacing: '0.15em',
      }}>
        INICIALIZANDO SISTEMA DE MONITOREO...
      </div>
    ),
  }
);

export default function LiveMapPage() {
  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 48px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <LiveMap />
    </div>
  );
}
