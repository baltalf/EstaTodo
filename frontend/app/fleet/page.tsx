'use client';
import React from 'react';
import Link from 'next/link';
import { TRUCKS, formatARS, getStatusBadge } from '@/lib/types';

export default function FleetPage() {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>Flota activa</h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{TRUCKS.length} vehículos registrados en L1</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {TRUCKS.map((truck) => (
          <Link key={truck.id} href={`/fleet/${truck.id}`} style={{ textDecoration: 'none' }}>
            <div className="sg-card" style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{truck.id}</div>
                  <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--text-2)', marginTop: 2 }}>{truck.plate}</div>
                </div>
                <span className={getStatusBadge(truck.status)}>{truck.status.replace('_', ' ')}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-2)' }}>Conductor</span>
                  <span style={{ color: 'var(--text-1)' }}>{truck.driver.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-2)' }}>DNI</span>
                  <span style={{ color: 'var(--text-1)', fontFamily: "'IBM Plex Mono',monospace" }}>{truck.driver.dni}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-2)' }}>Carga</span>
                  <span style={{ color: 'var(--text-1)', maxWidth: 140, textAlign: 'right' }}>{truck.cargo.description}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-2)' }}>Valor</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatARS(truck.cargo.value)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}>
                  <span>{truck.route.origin}</span>
                  <span style={{ color: 'var(--text-3)' }}>→</span>
                  <span>{truck.route.destination}</span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-green">Wallet verificada</span>
                {truck.incidents > 0 && (
                  <span className="badge badge-red">{truck.incidents} incidente{truck.incidents !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
