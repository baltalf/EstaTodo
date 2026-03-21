'use client';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Polygon, GeoJSON, Popup, Tooltip, Marker, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '@/lib/store';
import { TRUCKS, ROUTE_POLYLINES, formatARS, getStatusBadge, Truck, SGEvent } from '@/lib/types';

// Continent outline — faint context layer
const SOUTH_AMERICA_OUTLINE: [number, number][] = [
  [12.5, -72], [11, -74], [8, -77], [5, -77], [1, -79],
  [-2, -80], [-5, -81], [-8, -79], [-11, -77], [-14, -76],
  [-17, -75], [-19, -70], [-22, -70], [-24, -70], [-26, -70],
  [-28, -71], [-30, -71], [-33, -72], [-36, -73], [-38, -73],
  [-40, -73], [-42, -74], [-44, -66], [-46, -67], [-48, -69],
  [-50, -69], [-52, -70], [-54, -68], [-55, -65], [-56, -68],
  [-54, -71], [-51, -75], [-48, -75], [-44, -77], [-41, -73],
  [-38, -73], [-34, -53], [-30, -49], [-25, -47],
  [-22, -43], [-19, -39], [-15, -39], [-12, -38],
  [-8, -35], [-5, -35], [-2, -40], [0, -50],
  [2, -52], [5, -52], [7, -60], [7, -62],
  [6, -67], [5, -72], [3, -77], [1, -79],
  [8, -77], [11, -74], [12.5, -72]
];


// Fix Leaflet default icon issue with webpack/Next.js
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function getTruckFill(t: Truck): string {
  if (t.incidents > 0 || t.status === 'incidente') return '#EF4444';
  if (t.status === 'en_ruta') return '#10B981';
  return '#F59E0B';
}

function getTruckRadius(t: Truck): number {
  return 14;
}

interface IncidentDot {
  id: string;
  event: SGEvent;
  lat: number;
  lng: number;
}

export default function LiveMap() {
  const { incidents } = useStore();
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [selectedDot, setSelectedDot] = useState<IncidentDot | null>(null);
  const [escalating, setEscalating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [argentinaGeo, setArgentinaGeo] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provinciasGeo, setProvinciasGeo] = useState<any>(null);
  // Use a seed-stable jitter per incident so dots don't jump on re-render
  const [dotPositions] = useState<Map<string, { lat: number; lng: number }>>(() => new Map());

  // 1. Único array fuente de verdad para los datos de los camiones
  const trucksData = TRUCKS.map(t => ({
    id: t.id,
    position: [t.coords.lat, t.coords.lng] as [number, number],
    originalTruck: t
  }));

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/ARG.geo.json')
      .then(r => r.json())
      .then(data => setArgentinaGeo(data))
      .catch(() => {});

    fetch('https://raw.githubusercontent.com/mgubary/argentina-geojson/master/argentina_provincias.json')
      .then(r => r.json())
      .then(data => setProvinciasGeo(data))
      .catch(() => {});
  }, []);

  const incidentDots: IncidentDot[] = incidents.map((inc) => {
    const truck = TRUCKS.find((t) => t.cameraId === inc.event.camera_id);
    const base = truck?.coords ?? { lat: -34.6037, lng: -58.3816 };
    if (!dotPositions.has(inc.id)) {
      dotPositions.set(inc.id, {
        lat: base.lat + (Math.random() - 0.5) * 0.05,
        lng: base.lng + (Math.random() - 0.5) * 0.05,
      });
    }
    const pos = dotPositions.get(inc.id)!;
    return { id: inc.id, event: inc.event, lat: pos.lat, lng: pos.lng };
  });

  const handleEscalate = async (eventId: string) => {
    if (escalating) return;
    setEscalating(true);
    try {
      await fetch(`http://localhost:8001/api/events/${eventId}/dispute`, { method: 'POST' });
    } finally {
      setEscalating(false);
    }
  };

  // Build DivIcon for each truck
  const createTruckIcon = (truck: Truck) => {
    let color = '#10B981';
    let animationSpeed = '2.5s';
    // TRK-01 (or any with incidents>0) → red
    if (truck.incidents > 0 || truck.status === 'incidente') {
      color = '#EF4444';
      animationSpeed = '1.2s';
    } else if (truck.status === 'detenido') {
      color = '#F59E0B';
    }

    const glowStyles = color === '#EF4444'
      ? `0 0 16px #EF4444, 0 0 32px #EF444460`
      : `0 0 14px ${color}, 0 0 28px ${color}60, 0 0 4px white`;

    return L.divIcon({
      className: '',
      iconSize: [60, 60],
      iconAnchor: [30, 30],
      html: `
        <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;margin-left:-30px;margin-top:-30px">
          <div style="position:absolute;width:60px;height:60px;border-radius:50%;border:1px solid ${color}30;animation:radarPing ${animationSpeed} ease-out infinite"></div>
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;border:1px solid ${color}60;animation:radarPing ${animationSpeed} ease-out infinite 0.8s"></div>
          <div style="position:absolute;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #0d1f14;box-shadow:${glowStyles}"></div>
          <div style="position:absolute;top:-28px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(10,20,40,0.92);border:1px solid ${color}40;border-radius:3px;padding:2px 7px;font-size:10px;font-weight:700;color:${color};letter-spacing:0.08em;font-family:monospace">${truck.id}</div>
        </div>
      `,
    });
  };

  const createIncidentIcon = () => L.divIcon({
    className: '',
    iconAnchor: [7, 7],
    html: `
      <style>
        @keyframes estatodo-pulse {
          0%,100% { box-shadow: 0 0 10px #EF4444, 0 0 20px #EF4444; transform: scale(1); }
          50% { box-shadow: 0 0 25px #EF4444, 0 0 40px #EF444480; transform: scale(1.3); }
        }
      </style>
      <div style="
        width: 12px; height: 12px;
        border-radius: 50%;
        background: #EF4444;
        border: 1px solid white;
        animation: estatodo-pulse 0.8s infinite;
      "></div>`,
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
      <style>{`
        @keyframes radarPing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -100; }
        }
        .animated-route path {
          animation: dashMove 3s linear infinite;
        }
        .custom-map-container .leaflet-tile-pane {
          filter: brightness(0.7) contrast(1.3) saturate(1.5) hue-rotate(-15deg);
        }
      `}</style>
      {/* Map container — must have explicit height */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 500, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)',
          backgroundSize: '65px 65px'
        }} />
        {/* Edge vignette — darkens borders to look like war room screen */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 501, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,13,26,0.85) 100%)'
        }} />
        <MapContainer
          className="custom-map-container"
          center={[-34, -62]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
          />
          {/* Labels overlay for city names (faint) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.4}
          />
          <Rectangle 
            bounds={[[-60, -80], [0, -40]]} 
            pathOptions={{ color: 'transparent', fillColor: '#020810', fillOpacity: 0.25 }} 
          />

          {/* === SOUTH AMERICA OUTLINE — faint dashed blue context layer === */}
          <Polygon
            positions={SOUTH_AMERICA_OUTLINE}
            pathOptions={{ color: '#1e3a5f', weight: 3, opacity: 0.5, fillOpacity: 0, dashArray: '8 10' }}
          />
          <Polygon
            positions={SOUTH_AMERICA_OUTLINE}
            pathOptions={{ color: '#3b82f6', weight: 1, opacity: 0.3, fillOpacity: 0, dashArray: '8 10' }}
          />

          {/* === PROVINCE BORDERS — subtle tactical segmentation === */}
          {provinciasGeo && (
            <GeoJSON
              data={provinciasGeo}
              style={{ color: '#F59E0B', weight: 0.8, opacity: 0.4, fillOpacity: 0 }}
            />
          )}

          {/* === ARGENTINA GEOJSON BORDER — official outline, orange neon === */}
          {argentinaGeo && (
            <>
              {/* Glow halo */}
              <GeoJSON
                key="arg-glow"
                data={argentinaGeo}
                style={{ color: '#F59E0B', weight: 6, opacity: 0.15, fillOpacity: 0 }}
              />
              {/* Neon border line */}
              <GeoJSON
                key="arg-border"
                data={argentinaGeo}
                style={{ color: '#F59E0B', weight: 1.5, opacity: 1, fillOpacity: 0 }}
              />
            </>
          )}

          {/* === CITY DOTS — minimal orange beacons === */}
          {[
            { name: 'Buenos Aires', pos: [-34.6, -58.4] as [number,number] },
            { name: 'Córdoba',       pos: [-31.4, -64.2] as [number,number] },
            { name: 'Mendoza',       pos: [-32.9, -68.8] as [number,number] },
            { name: 'Rosario',       pos: [-32.9, -60.7] as [number,number] },
            { name: 'Tucumán',       pos: [-26.8, -65.2] as [number,number] },
            { name: 'Salta',         pos: [-24.8, -65.4] as [number,number] },
          ].map(({ name, pos }) => (
            <Marker 
              key={name}
              position={pos} 
              icon={L.divIcon({
                className: '',
                html: `<div style="width:6px;height:6px;background:#F59E0B;border-radius:50%;box-shadow:0 0 8px 2px #F59E0B80"></div>`,
                iconAnchor: [3, 3]
              })}
            />
          ))}

          {/* Convoy line — Electric Cyan Glow (Stacked Polylines) */}
          {/* Glow difuso por debajo */}
          <Polyline
            positions={trucksData.map(t => t.position)}
            pathOptions={{ color: '#00ffff', weight: 8, opacity: 0.15 }}
          />
          {/* Línea principal */}
          <Polyline
            positions={trucksData.map(t => t.position)}
            pathOptions={{ color: '#00ffff', weight: 2, opacity: 0.9 }}
          />

          {/* Truck markers — Custom orange glow DivIcon */}
          {trucksData.map((t) => {
            const color = t.originalTruck.incidents > 0 ? '#EF4444' : '#ff6600';
            const icon = L.divIcon({
              className: '',
              html: `
                <div style="
                  width: 14px;
                  height: 14px;
                  background: ${color};
                  border-radius: 50%;
                  box-shadow: 0 0 6px 3px ${color}, 0 0 20px 6px ${color}88;
                  position: relative;
                ">
                  <div style="position:absolute;top:-24px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(10,20,40,0.92);border:1px solid ${color}40;border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;color:${color};letter-spacing:0.05em;font-family:monospace">${t.id}</div>
                </div>
              `,
              iconAnchor: [7, 7],
            });

            return (
              <Marker
                key={t.id}
                position={t.position}
                icon={icon}
                eventHandlers={{
                  click: () => { setSelectedTruck(t.originalTruck); setSelectedDot(null); },
                }}
              />
            );
          })}

          {/* Incident dots from WebSocket — DivIcon with fast pulse */}
          {incidentDots.map((dot) => (
            <Marker
              key={dot.id}
              position={[dot.lat, dot.lng]}
              icon={createIncidentIcon()}
              eventHandlers={{ click: () => { setSelectedDot(dot); setSelectedTruck(null); } }}
            />
          ))}
        </MapContainer>

        {/* Incident dot modal — absolute inside the map div, NOT inside MapContainer */}
        {selectedDot && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderTop: '2px solid var(--danger)',
            borderRadius: 10, padding: 20, width: 360,
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span className="badge badge-red" style={{ marginBottom: 6, display: 'block', width: 'fit-content' }}>
                  {selectedDot.event.type}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono',monospace" }}>
                  {new Date(selectedDot.event.timestamp || Date.now()).toLocaleString('es-AR')}
                </div>
              </div>
              <button onClick={() => setSelectedDot(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hash</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--cyber-teal)' }}>
                  {selectedDot.event.hash_sha256?.substring(0, 16) ?? '—'}…
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Blockchain</span>
                <span className={selectedDot.event.blockchain_tx ? 'badge badge-blue' : 'badge badge-amber'}>
                  {selectedDot.event.blockchain_status || 'pending'}
                </span>
              </div>
              {selectedDot.event.genlayer_verdict && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Genlayer</span>
                  <span className="badge badge-red">{selectedDot.event.genlayer_verdict}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="sg-btn sg-btn-web3"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleEscalate(selectedDot.event.id)}
                disabled={escalating}
              >
                {escalating ? 'Escalando...' : 'Sellar en Genlayer'}
              </button>
              <a
                href={`/events/${selectedDot.event.id}`}
                className="sg-btn sg-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
              >
                Ver evidencia →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ width: 260, height: '100%', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedTruck ? (
          <TruckPanel truck={selectedTruck} onClose={() => setSelectedTruck(null)} />
        ) : (
          <AlertsPanel incidents={incidents} onSelectDot={(inc) => {
            const t = TRUCKS.find((t) => t.cameraId === inc.event.camera_id);
            const pos = dotPositions.get(inc.id) ?? { lat: t?.coords.lat ?? -34.60, lng: t?.coords.lng ?? -58.38 };
            setSelectedDot({ id: inc.id, event: inc.event, lat: pos.lat, lng: pos.lng });
          }} />
        )}
      </div>
    </div>
  );
}

/* ————— Sub-components ————— */

function TruckPanel({ truck, onClose }: { truck: Truck; onClose: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{truck.id}</div>
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--text-secondary)' }}>{truck.plate}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={getStatusBadge(truck.status)}>{truck.status.replace('_', ' ')}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PanelSection title="Conductor">
          <PanelRow label="Nombre" value={truck.driver.name} />
          <PanelRow label="DNI" value={truck.driver.dni} mono />
        </PanelSection>

        <PanelSection title="Carga">
          <PanelRow label="Descripción" value={truck.cargo.description} />
          <PanelRow label="Valor" value={formatARS(truck.cargo.value)} accent />
          <PanelRow label="Remito" value={truck.cargo.remito} mono />
        </PanelSection>

        <PanelSection title="Ruta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>{truck.route.origin}</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span>{truck.route.destination}</span>
          </div>
          <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ width: '65%', height: '100%', background: 'var(--brand-blue)', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>65% completado</div>
        </PanelSection>

        {truck.incidents > 0 && (
          <PanelSection title={`Incidentes (${truck.incidents})`}>
            <div style={{ fontSize: 12, color: 'var(--danger)' }}>{truck.incidents} alerta{truck.incidents !== 1 ? 's' : ''} registrada{truck.incidents !== 1 ? 's' : ''}</div>
          </PanelSection>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href={`/fleet/${truck.id}`} className="sg-btn sg-btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>
            Ver ruta completa →
          </a>
          <a href="/events" className="sg-btn sg-btn-ghost" style={{ justifyContent: 'center', textDecoration: 'none' }}>
            Ver historial
          </a>
        </div>
      </div>
    </div>
  );
}

function AlertsPanel({ incidents, onSelectDot }: { incidents: any[]; onSelectDot: (i: any) => void }) {
  const { wsConnected } = useStore();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(180deg, #080e1a 0%, #0a1628 100%)', borderLeft: '1px solid #06B6D415' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #06B6D415', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, letterSpacing: '0.2em', color: '#06B6D4', textTransform: 'uppercase', fontWeight: 600 }}>
          Últimas Alertas
        </span>
        {wsConnected ? (
          <span style={{ fontSize: 9, letterSpacing: '0.15em', color: '#10B981', fontWeight: 600 }}>
            ● SISTEMA ACTIVO
          </span>
        ) : (
          <span style={{ fontSize: 9, letterSpacing: '0.15em', color: '#F59E0B', fontWeight: 600, animation: 'radarPing 1.5s infinite' }}>
            ● CONECTANDO...
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
        {incidents.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Sin alertas recientes.
          </div>
        ) : (
          incidents.slice(0, 8).map((inc, i) => {
            const truck = TRUCKS.find((t) => t.cameraId === inc.event.camera_id);
            return (
              <div
                key={inc.id + i}
                onClick={() => onSelectDot(inc)}
                style={{
                  background: 'rgba(30,41,59,0.6)', border: '0.5px solid #EF444430', borderLeft: '2px solid #EF4444',
                  borderRadius: 4, padding: '8px 12px', margin: '4px 8px', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, marginBottom: 4 }}>
                  ⚠ INCIDENTE · {truck?.id ?? 'Desconocido'}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, lineHeight: 1.3 }}>
                  {inc.event.incident_description ?? `Incidente detectado en cámara ${inc.event.camera_id}`}
                </div>
                <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: '#06B6D4' }}>
                  {inc.event.hash_sha256 ? `${inc.event.hash_sha256.substring(0,24)}...` : 'Sin hash'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function PanelRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        color: accent ? 'var(--brand-blue)' : 'var(--text-primary)',
        fontFamily: mono ? "'IBM Plex Mono',monospace" : undefined,
        fontWeight: accent ? 600 : undefined,
      }}>{value}</span>
    </div>
  );
}
