'use client';
import React from 'react';
import { TENANTS } from '@/lib/types';

export default function TenantsPage() {
  const planBadge = (plan: string) => {
    const cls = plan === 'Pro' ? 'badge badge-blue' : 'badge badge-gray';
    return <span className={cls}>{plan}</span>;
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Tenants</h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>KYC / Gestión de organizaciones</p>
      </div>

      <div className="sg-card" style={{ overflow: 'hidden' }}>
        <table className="sg-table">
          <thead>
            <tr>
              <th>Organización</th><th>CUIT</th><th>Plan</th>
              <th>Cámaras</th><th>Wallets L1</th><th>Estado L1</th>
              <th>Eventos / mes</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {TENANTS.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--text-3)' }}>{t.id}</div>
                </td>
                <td><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{t.cuit}</span></td>
                <td>{planBadge(t.plan)}</td>
                <td>{t.cameras}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {t.wallets.map((w) => (
                      <span key={w} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-2)' }}>{w}</span>
                    ))}
                  </div>
                </td>
                <td>
                  {t.l1Status === 'active'
                    ? <span className="badge badge-green">Activo</span>
                    : <span className="badge badge-gray">Inactivo</span>}
                </td>
                <td style={{ fontWeight: 600 }}>{t.eventsThisMonth}</td>
                <td>
                  <button className="sg-btn sg-btn-ghost" style={{ fontSize: 12 }}>Gestionar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
