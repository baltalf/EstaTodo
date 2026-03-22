'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Truck, formatARS, getStatusBadge } from '@/lib/types';

const CHECKPOINT_STATES: Record<string, ('ok' | 'incident' | 'current' | 'pending')[]> = {
  'TRK-01': ['ok', 'ok', 'current', 'pending', 'pending'],
  'TRK-02': ['ok', 'current', 'pending', 'pending'],
  'TRK-03': ['ok', 'incident', 'incident', 'current', 'pending', 'pending'],
};

const CHECKPOINT_TIMES: Record<string, string[]> = {
  'TRK-01': ['06:15', '08:30', '', '', ''],
  'TRK-02': ['09:00', '', '', ''],
  'TRK-03': ['11:00', '13:45', '15:20', '', '', ''],
};

type CheckpointState = 'ok' | 'incident' | 'current' | 'pending';

function CheckpointDot({ state }: { state: CheckpointState }) {
  const colors: Record<CheckpointState, string> = {
    ok: 'var(--success)', incident: 'var(--danger)', current: 'var(--warning)', pending: 'var(--border)',
  };
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: state === 'pending' ? 'var(--bg-primary)' : colors[state],
      border: `2px solid ${colors[state]}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
    }}>
      {state === 'ok' && '✓'}
      {state === 'incident' && '!'}
      {state === 'current' && '→'}
    </div>
  );
}

export default function FleetDetail({
  truck,
  checkpoints,
}: {
  truck: Truck;
  checkpoints: string[];
}) {
  const states = CHECKPOINT_STATES[truck.id] ?? [];
  const times = CHECKPOINT_TIMES[truck.id] ?? [];
  const router = useRouter();

  const completedCount = states.filter((s) => s === 'ok' || s === 'incident').length;
  const progressPct = checkpoints.length > 0
    ? Math.round((completedCount / checkpoints.length) * 100)
    : 0;

  return (
    <div style={{ padding: 28, width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{truck.id}</h1>
          <span style={{ fontSize: 16, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--text-secondary)' }}>
            {truck.plate}
          </span>
          <span className={getStatusBadge(truck.status)}>{truck.status.replace('_', ' ')}</span>
          {truck.incidents > 0 && (
            <span className="badge badge-red">{truck.incidents} incidente{truck.incidents !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {truck.driver.name} · DNI {truck.driver.dni}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Progreso', value: `${progressPct}%` },
          { label: 'Valor asegurado', value: formatARS(truck.cargo.value) },
          { label: 'Checkpoints OK', value: `${states.filter(s => s === 'ok').length}/${checkpoints.length}` },
          { label: 'Incidentes', value: String(truck.incidents) },
        ].map((s) => (
          <div key={s.label} className="sg-card" style={{ 
            padding: '14px 16px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, textAlign: 'center' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
          <span>{truck.route.origin}</span>
          <span>{truck.route.destination}</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--brand-blue)', borderRadius: 3, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* 2 columns layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* COLUMNA IZQUIERDA — Timeline */}
        <div className="sg-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Timeline de checkpoints
          </h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
            {/* Vertical connector line */}
            <div style={{ position: 'absolute', left: 13, top: 14, bottom: 14, width: 2, background: 'var(--border)' }} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {checkpoints.map((cp, i) => {
                const state = states[i] ?? 'pending';
                const time = times[i];
                return (
                  <div key={cp + i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < checkpoints.length - 1 ? 24 : 0 }}>
                    <CheckpointDot state={state} />
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: state === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {cp}
                        </span>
                        {time && (
                          <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--text-secondary)' }}>{time}</span>
                        )}
                      </div>

                      {state === 'ok' && (
                        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--success)' }}>
                          ✓ Sin alertas · Hash verificado on-chain
                        </div>
                      )}
                      {state === 'incident' && (
                        <div style={{ marginTop: 6, background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '8px 10px', fontSize: 11 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span className="badge badge-red">ALERTA DETECTADA</span>
                            <span className="badge badge-amber">Sin veredicto</span>
                          </div>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: 'var(--cyber-teal)', fontSize: 10 }}>
                            a3f9c2b1d0e8f47a…
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <a href="/events" className="sg-btn sg-btn-ghost" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>
                              Ver evidencia →
                            </a>
                          </div>
                        </div>
                      )}
                      {state === 'current' && (
                        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--warning)' }}>
                          En camino · ETA ~2h
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* COLUMNA DERECHA — Info extra */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Card 1 - Carga Asegurada */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#06B6D4', letterSpacing: '0.07em', marginBottom: 16, fontWeight: 700 }}>
              Carga Asegurada
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>
              {truck.cargo.description}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>
              {formatARS(truck.cargo.value)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>Federación Patronal</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#10B981', background: '#064e3b', padding: '4px 8px', borderRadius: 4 }}>
                Póliza activa ✓
              </div>
            </div>
          </div>

          {/* Card 2 - Conductor */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#06B6D4', letterSpacing: '0.07em', marginBottom: 16, fontWeight: 700 }}>
              Conductor
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#FFF' }}>
                {truck.driver.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 2 }}>
                  {truck.driver.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  DNI: {truck.driver.dni}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '1px solid #334155', paddingTop: 16 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>Cat. E · Vence 12/2026</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#10B981', background: '#064e3b', padding: '4px 8px', borderRadius: 4 }}>
                Sin antecedentes ✓
              </div>
            </div>
          </div>

          {/* Card 3 - Último evento blockchain */}
          <div style={{ background: '#1E293B', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#06B6D4', letterSpacing: '0.07em', marginBottom: 16, fontWeight: 700 }}>
              Último registro on-chain
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#06B6D4', marginBottom: 4 }}>
              5a83583d9b47a...
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#64748B', marginBottom: 12 }}>
              TX: 0x641ea192a5...
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>hace 2 horas</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#06B6D4', background: '#083344', padding: '4px 8px', borderRadius: 4 }}>
                Avalanche L1 · Confirmado ✓
              </div>
            </div>
          </div>

          {/* Card 4 - Incidente activo (Dynamic) */}
          {truck.incidents > 0 && (
            <div style={{ background: '#1E293B', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#EF4444', letterSpacing: '0.07em', fontWeight: 700 }}>
                  INCIDENTE ACTIVO
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: '#450a0a', padding: '4px 8px', borderRadius: 4 }}>
                  ROBO_CONFIRMADO
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#F1F5F9', marginBottom: 16, lineHeight: 1.5 }}>
                Desvío de ruta detectado seguido por apertura no autorizada de compuertas traseras y pérdida de contacto de cámara.
              </div>
              <button 
                onClick={() => router.push('/events')}
                style={{ 
                  background: 'transparent', border: '1px solid #EF4444', color: '#EF4444',
                  width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ver evidencia completa →
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
