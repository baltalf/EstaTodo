'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer, ArcLayer, TextLayer } from '@deck.gl/layers'
import Map from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

const TRUCKS = [
  {
    id: 'TRK-01',
    position: [-58.3816, -34.6037],
    status: 'incidente',
    driver: 'Juan Pérez',
    cargo: 'Electrodomésticos Samsung',
    value: 2100000,
    incidents: 1,
    origin: [-58.3816, -34.6037],
    destination: [-64.1888, -31.4201],
  },
  {
    id: 'TRK-02',
    position: [-64.1888, -31.4201],
    status: 'en_ruta',
    driver: 'Carlos López',
    cargo: 'Indumentaria deportiva',
    value: 420000,
    incidents: 0,
    origin: [-60.7, -32.9],
    destination: [-64.1888, -31.4201],
  },
  {
    id: 'TRK-03',
    position: [-68.8272, -32.8908],
    status: 'detenido',
    driver: 'Miguel Torres',
    cargo: 'Electrónica importada',
    value: 1200000,
    incidents: 2,
    origin: [-68.8272, -32.8908],
    destination: [-58.3816, -34.6037],
  },
]

const STATUS_COLOR: Record<string, [number, number, number]> = {
  en_ruta:   [16, 185, 129],
  detenido:  [245, 158, 11],
  incidente: [239, 68, 68],
}

const STATUS_HEX: Record<string, string> = {
  en_ruta:   '#10B981',
  detenido:  '#F59E0B',
  incidente: '#EF4444',
}

const INITIAL_VIEW_STATE = {
  longitude: -63,
  latitude: -25,
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
}

export default function LiveMapDeckGL() {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [hoveredTruck, setHoveredTruck] = useState<any>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [detailPanel, setDetailPanel] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    
    let animationFrame: number
    let bearing = 0
    
    const rotate = () => {
      bearing -= 0.02
      map.setBearing(bearing)
      animationFrame = requestAnimationFrame(rotate)
    }
    
    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(rotate)
    }, 2000)
    
    const stopRotation = () => cancelAnimationFrame(animationFrame)
    map.on('mousedown', stopRotation)
    map.on('touchstart', stopRotation)
    
    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  const onViewStateChange = useCallback(
    ({ viewState }: any) => setViewState(viewState), []
  )

  const pulseRadius = 40000

  const arcLayer = new ArcLayer({
    id: 'arcs',
    data: TRUCKS,
    getSourcePosition: (d: any) => d.origin,
    getTargetPosition: (d: any) => d.destination,
    getSourceColor: (d: any) => [...STATUS_COLOR[d.status], 200] as any,
    getTargetColor: (d: any) => [...STATUS_COLOR[d.status], 30] as any,
    getWidth: 2.5,
    greatCircle: true,
    getHeight: 0.5,
  })

  const pulseLayer = new ScatterplotLayer({
    id: 'pulse',
    data: TRUCKS,
    getPosition: (d: any) => d.position,
    getColor: (d: any) => [...STATUS_COLOR[d.status], 20] as any,
    getRadius: pulseRadius,
    radiusUnits: 'meters',
    pickable: false,
  })

  const truckLayer = new ScatterplotLayer({
    id: 'trucks',
    data: TRUCKS,
    getPosition: (d: any) => d.position,
    getColor: (d: any) => STATUS_COLOR[d.status],
    getRadius: 18000,
    radiusMinPixels: 7,
    radiusMaxPixels: 14,
    pickable: true,
    stroked: true,
    getLineColor: [255, 255, 255, 180] as any,
    lineWidthMinPixels: 1.5,
    onClick: ({ object }: any) => {
      if (object) {
        setSelectedTruck(object)
        setDetailPanel(object)
      }
    },
    onHover: ({ object, x, y }: any) => {
      setHoveredTruck(object || null)
      setTooltipPos({ x, y })
    },
  })

  const textLayer = new TextLayer({
    id: 'labels',
    data: TRUCKS,
    getPosition: (d: any) => d.position,
    getText: (d: any) => d.id,
    getSize: 11,
    getColor: [255, 255, 255, 220] as any,
    getPixelOffset: [0, -30],
    fontFamily: 'monospace',
    fontWeight: 'bold',
    background: true,
    getBackgroundColor: [10, 20, 40, 220] as any,
    backgroundPadding: [4, 2, 4, 2],
    getBorderColor: (d: any) => [...STATUS_COLOR[d.status], 180] as any,
    getBorderWidth: 1,
    pickable: false,
  })

  const layers = [arcLayer, pulseLayer, truckLayer, textLayer]

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      background: '#080e1a',
      overflow: 'hidden',
    }}>
      {/* Cuadrícula militar */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '70px 70px',
      }} />

      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: '0', zIndex: '2' }}
        getCursor={({ isDragging, isHovering }: any) =>
          isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'
        }
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/navigation-night-v1"
          style={{ width: '100%', height: '100%' }}
          projection="globe"
          onLoad={(e: any) => {
            try {
              const map = e.target
              // Agua azul oscuro militar
              map.setPaintProperty('water', 'fill-color', '#020d1f')
              
              // Contornos de PAÍSES en cyan neón
              map.setPaintProperty('admin-0-boundary', 'line-color', '#06B6D4')
              map.setPaintProperty('admin-0-boundary', 'line-opacity', 0.7)
              map.setPaintProperty('admin-0-boundary', 'line-width', 1.5)
              
              // Halo/glow del contorno de países
              if (map.getLayer('admin-0-boundary-bg')) {
                map.setPaintProperty('admin-0-boundary-bg', 'line-color', '#06B6D4')
                map.setPaintProperty('admin-0-boundary-bg', 'line-opacity', 0.15)
                map.setPaintProperty('admin-0-boundary-bg', 'line-width', 6)
              }
              
              // Contornos de PROVINCIAS en azul sutil
              map.setPaintProperty('admin-1-boundary', 'line-color', '#1E40AF')
              map.setPaintProperty('admin-1-boundary', 'line-opacity', 0.4)
              map.setPaintProperty('admin-1-boundary', 'line-width', 0.8)
              
              // Labels de países más visibles
              if (map.getLayer('country-label')) {
                map.setPaintProperty('country-label', 'text-color', '#94A3B8')
              }
              
              // Labels de ciudades
              if (map.getLayer('settlement-major-label')) {
                map.setPaintProperty('settlement-major-label', 'text-color', '#475569')
              }
            } catch (err) {
              console.warn('Map style error:', err)
            }
          }}
        />
      </DeckGL>

      {/* Tooltip */}
      {hoveredTruck && (
        <div style={{
          position: 'absolute',
          left: tooltipPos.x + 12,
          top: tooltipPos.y - 12,
          zIndex: 10,
          background: 'rgba(8,14,26,0.97)',
          border: `0.5px solid ${STATUS_HEX[hoveredTruck.status]}`,
          borderRadius: '8px',
          padding: '10px 14px',
          pointerEvents: 'none',
          minWidth: '180px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#F1F5F9', marginBottom: '4px' }}>
            {hoveredTruck.id}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>
            👤 {hoveredTruck.driver}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
            📦 {hoveredTruck.cargo}
          </div>
          <div style={{
            fontSize: '11px', fontWeight: '600',
            color: hoveredTruck.incidents > 0 ? '#EF4444' : '#10B981',
          }}>
            {hoveredTruck.incidents > 0
              ? `⚠ ${hoveredTruck.incidents} incidente(s)`
              : '✓ Sin incidentes'}
          </div>
        </div>
      )}

      {/* Panel de detalle del camión */}
      {detailPanel && (() => {
        const truck = detailPanel;
        return (
          <div style={{
            position: 'absolute',
            left: '220px',
            top: 0, bottom: 0,
            width: '300px',
            zIndex: 20,
            background: 'rgba(8,14,26,0.97)',
            borderRight: '1px solid #334155',
            backdropFilter: 'blur(10px)',
            overflowY: 'auto'
          }}>
            <div style={{
              background: '#1E293B', padding: '14px 16px',
              borderBottom: '0.5px solid #334155', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ color: STATUS_HEX[truck.status], fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {truck.id}
                </div>
                <div style={{ color: '#64748B', fontSize: '12px' }}>
                  {truck.driver}
                </div>
              </div>
              <div 
                onClick={() => setDetailPanel(null)}
                style={{ color: '#64748B', cursor: 'pointer', padding: '4px', fontSize: '16px' }}
              >✕</div>
            </div>

            <div style={{ padding: '14px 16px' }}>
              <div style={{ background: '#1E293B', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Estado</span>
                  <span style={{ 
                    padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', fontSize: '10px',
                    background: truck.status === 'incidente' ? '#450a0a' : truck.status === 'en_ruta' ? '#052e16' : '#1c1917',
                    color: STATUS_HEX[truck.status]
                  }}>
                    {truck.status === 'incidente' ? 'INCIDENTE' : truck.status === 'en_ruta' ? 'EN RUTA' : 'DETENIDO'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Carga</span>
                  <span style={{ color: '#E2E8F0', textAlign: 'right', maxWidth: '140px' }}>{truck.cargo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Valor</span>
                  <span style={{ color: '#E2E8F0' }}>${truck.value.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Incidentes</span>
                  <span style={{ color: truck.incidents > 0 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>
                    {truck.incidents}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 16px 14px' }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748B', marginBottom: '8px', fontWeight: 'bold' }}>RUTA ACTIVA</div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#E2E8F0' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginRight: '8px' }} />
                <span>{truck.id === 'TRK-01' ? 'Buenos Aires' : truck.id === 'TRK-02' ? 'Córdoba' : 'Mendoza'}</span>
                <div style={{ flex: 1, height: '1px', background: '#334155', margin: '0 8px' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748B', marginRight: '8px' }} />
                <span>{truck.id === 'TRK-01' ? 'Córdoba' : truck.id === 'TRK-02' ? 'Rosario' : 'Buenos Aires'}</span>
              </div>
            </div>

            {truck.incidents > 0 && (
              <div style={{ padding: '0 16px 14px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#EF4444', marginBottom: '8px', fontWeight: 'bold' }}>ÚLTIMO INCIDENTE</div>
                <div style={{ background: '#1E293B', borderLeft: '2px solid #EF4444', borderRadius: '0 8px 8px 0', padding: '12px' }}>
                  <div style={{ color: '#E2E8F0', fontSize: '12px', marginBottom: '6px' }}>Robo confirmado por Genlayer</div>
                  <div style={{ 
                    display: 'inline-block', fontSize: '10px', background: '#450a0a', 
                    color: '#EF4444', padding: '2px 6px', borderRadius: '4px', marginBottom: '10px', fontWeight: 'bold'
                  }}>
                    ROBO_CONFIRMADO
                  </div>
                  <div>
                    <button 
                      onClick={() => router.push('/events')}
                      style={{ color: '#06B6D4', fontSize: '12px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                    >
                      Ver evidencia completa →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button 
                onClick={() => router.push('/fleet/' + truck.id.toLowerCase().replace('-', ''))}
                style={{ background: '#2563EB', color: 'white', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none' }}
              >
                Ver flota completa →
              </button>
              <button 
                onClick={() => router.push('/events')}
                style={{ background: 'transparent', border: '0.5px solid #334155', color: '#94A3B8', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                Ver eventos →
              </button>
            </div>
          </div>
        );
      })()}

      {/* Panel lateral */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '260px',
        zIndex: 5,
        background: 'linear-gradient(180deg, rgba(8,14,26,0.97) 0%, rgba(10,20,40,0.95) 100%)',
        borderLeft: '1px solid rgba(6,182,212,0.12)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(6,182,212,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: '9px', letterSpacing: '0.2em',
            color: '#06B6D4', textTransform: 'uppercase', fontWeight: '600',
          }}>
            ÚLTIMAS ALERTAS
          </span>
          <span style={{ fontSize: '8px', letterSpacing: '0.12em', color: '#10B981' }}>
            ● SISTEMA ACTIVO
          </span>
        </div>

        <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
          {TRUCKS.map(truck => (
            <div
              key={truck.id}
              onClick={() => setSelectedTruck(truck)}
              style={{
                background: selectedTruck?.id === truck.id
                  ? 'rgba(37,99,235,0.15)' : '#1E293B',
                border: `0.5px solid ${truck.incidents > 0 ? '#EF444430' : '#334155'}`,
                borderLeft: `2px solid ${STATUS_HEX[truck.status]}`,
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '3px',
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: '700',
                  color: '#F1F5F9', fontFamily: 'monospace',
                }}>
                  {truck.id}
                </span>
                <span style={{
                  fontSize: '9px', padding: '2px 6px',
                  borderRadius: '3px', fontWeight: '600',
                  background: truck.status === 'incidente' ? '#450a0a' :
                    truck.status === 'en_ruta' ? '#052e16' : '#1c1917',
                  color: STATUS_HEX[truck.status],
                }}>
                  {truck.status === 'incidente' ? '⚠ INCIDENTE' :
                   truck.status === 'en_ruta' ? '● EN RUTA' : '◼ DETENIDO'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>{truck.driver}</div>
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{truck.cargo}</div>
              {truck.incidents > 0 && (
                <div style={{
                  fontSize: '10px', color: '#EF4444',
                  fontWeight: '600', marginTop: '5px', fontFamily: 'monospace',
                }}>
                  {truck.incidents} incidente(s) registrado(s)
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(6,182,212,0.08)',
          fontSize: '10px',
        }}>
          <div style={{ color: '#475569', marginBottom: '2px' }}>EstaTodo · Transportes del Sur</div>
          <div style={{ fontFamily: 'monospace', color: '#334155' }}>Avalanche L1 · Chain 99372</div>
        </div>
      </div>
    </div>
  )
}
