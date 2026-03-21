'use client';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

const LABELS: Record<string, string> = {
  '/live-map': 'Live Map',
  '/fleet': 'Flota',
  '/dispatch': 'Despacho',
  '/stock': 'Stock',
  '/events': 'Eventos',
  '/tenants': 'Tenants',
};

export function TopBar() {
  const pathname = usePathname();
  const { wsConnected } = useStore();

  const seg = '/' + (pathname.split('/')[1] || '');
  const label = LABELS[seg] || seg;

  return (
    <div style={{
      height: 48, background: 'rgba(10,15,30,0.95)',
      borderBottom: '0.5px solid #0f2040',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-muted)' }}>EstaTodo</span>
        <span style={{ color: 'var(--border-strong)' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: wsConnected ? 'var(--success)' : 'var(--danger)' }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: wsConnected ? 'var(--success)' : 'var(--danger)',
          animation: wsConnected ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
        }} />
        {wsConnected ? 'Backend conectado' : 'Sin conexión'}
      </div>
    </div>
  );
}
