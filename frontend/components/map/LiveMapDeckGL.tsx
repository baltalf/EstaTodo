'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer, ArcLayer, TextLayer } from '@deck.gl/layers'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { TRUCKS, STATUS_COLOR, STATUS_HEX } from '@/lib/types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const INITIAL_VIEW_STATE = {
  longitude: -63,
  latitude: -30,
  zoom: 3.0,
  pitch: 40,
  bearing: -10,
}

// Destination coords lookup for ArcLayer
const DEST_COORDS: Record<string, [number, number]> = {
  'TRK-01': [-64.1888, -31.4201],
  'TRK-02': [-68.8272, -32.8908],
  'TRK-03': [-58.3816, -34.6037],
}

export default function LiveMapDeckGL() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [hoveredTruck, setHoveredTruck] = useState<any>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [detailPanel, setDetailPanel] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Initialize Mapbox GL as a standalone map (not inside DeckGL)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      pitch: INITIAL_VIEW_STATE.pitch,
      bearing: INITIAL_VIEW_STATE.bearing,
      interactive: false,
      antialias: true,
      fadeDuration: 0,
    })

    mapRef.current = map

    map.on('load', () => {
      try {
        // Satellite style country borders — Cyan Neon
        if (map.getLayer('admin-0-boundary')) {
          map.setPaintProperty('admin-0-boundary', 'line-color', '#00FFD1')
          map.setPaintProperty('admin-0-boundary', 'line-opacity', 0.9)
          map.setPaintProperty('admin-0-boundary', 'line-width', 1.5)
        }
        if (map.getLayer('admin-0-boundary-bg')) {
          map.setPaintProperty('admin-0-boundary-bg', 'line-color', '#00FFD1')
          map.setPaintProperty('admin-0-boundary-bg', 'line-opacity', 0.2)
          map.setPaintProperty('admin-0-boundary-bg', 'line-width', 8)
        }
        if (map.getLayer('admin-1-boundary')) {
          map.setPaintProperty('admin-1-boundary', 'line-color', '#1E40AF')
          map.setPaintProperty('admin-1-boundary', 'line-opacity', 0.5)
          map.setPaintProperty('admin-1-boundary', 'line-width', 0.8)
        }
        // Country labels slightly brighter with black halo
        if (map.getLayer('country-label')) {
          map.setPaintProperty('country-label', 'text-color', '#F8FAFC')
          map.setPaintProperty('country-label', 'text-halo-color', '#000000')
          map.setPaintProperty('country-label', 'text-halo-width', 1.5)
        }
        if (map.getLayer('settlement-major-label')) {
          map.setPaintProperty('settlement-major-label', 'text-color', '#94A3B8')
          map.setPaintProperty('settlement-major-label', 'text-halo-color', '#000000')
          map.setPaintProperty('settlement-major-label', 'text-halo-width', 1)
        }
      } catch (err) {
        console.warn('Map style error:', err)
      }

      // Optional globe projection
      try { (map as any).setProjection('globe') } catch (_) {}
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Sync DeckGL viewState → Mapbox — throttled with RAF to avoid zoom lag
  const rafRef = useRef<number>(0)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
      })
    })
  }, [viewState])

  const onViewStateChange = useCallback(
    ({ viewState }: any) => setViewState(viewState), []
  )

  const pulseRadius = 40000

  const arcLayer = new ArcLayer({
    id: 'arcs',
    data: TRUCKS,
    getSourcePosition: (d: any) => [d.coords.lng, d.coords.lat] as [number, number],
    getTargetPosition: (d: any) => DEST_COORDS[d.id] ?? [d.coords.lng, d.coords.lat],
    getSourceColor: (d: any) => [...STATUS_COLOR[d.status], 200] as any,
    getTargetColor: (d: any) => [...STATUS_COLOR[d.status], 30] as any,
    getWidth: 2.5,
    greatCircle: true,
    getHeight: 0.5,
  })

  const pulseLayer = new ScatterplotLayer({
    id: 'pulse',
    data: TRUCKS,
    getPosition: (d: any) => [d.coords.lng, d.coords.lat] as [number, number],
    getFillColor: (d: any) => [...STATUS_COLOR[d.status], 20] as any,
    getRadius: pulseRadius,
    radiusUnits: 'meters',
    pickable: false,
  })

  const truckLayer = new ScatterplotLayer({
    id: 'trucks',
    data: TRUCKS,
    getPosition: (d: any) => [d.coords.lng, d.coords.lat] as [number, number],
    getFillColor: (d: any) => STATUS_COLOR[d.status],
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
    getPosition: (d: any) => [d.coords.lng, d.coords.lat] as [number, number],
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
      {/* Mapbox GL base map */}
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />

      {/* Standard Satellite Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,255,200,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,200,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* DeckGL overlay — only mount after DOM is ready to avoid WebGL init crash */}
      {mounted && (
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={true}
        layers={layers}
        useDevicePixels={false}
        // @ts-ignore — force WebGL device to avoid luma.gl v9 init crash
        deviceProps={{ type: 'webgl' }}
        style={{ position: 'absolute', inset: '0', zIndex: '3' }}
        getCursor={({ isDragging, isHovering }: any) =>
          isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'
        }
      />
      )}

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
            👤 {hoveredTruck.driver.name}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
            📦 {hoveredTruck.cargo.description}
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

      {/* Click detail panel — compact square card */}
      {detailPanel && (() => {
        const truck = detailPanel
        return (
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '16px',
            width: '280px',
            zIndex: 20,
            background: 'rgba(8,14,26,0.97)',
            border: '1px solid #334155',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              background: '#1E293B', padding: '14px 16px',
              borderBottom: '0.5px solid #334155', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ color: STATUS_HEX[truck.status], fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {truck.id}
                </div>
                <div style={{ color: '#64748B', fontSize: '12px' }}>
                  {truck.driver.name}
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
                    color: STATUS_HEX[truck.status],
                  }}>
                    {truck.status === 'incidente' ? 'INCIDENTE' : truck.status === 'en_ruta' ? 'EN RUTA' : 'DETENIDO'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Carga</span>
                  <span style={{ color: '#E2E8F0', textAlign: 'right', maxWidth: '140px' }}>{truck.cargo.description}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Valor</span>
                  <span style={{ color: '#E2E8F0' }}>${truck.cargo.value.toLocaleString()}</span>
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
                <span>{truck.route.origin}</span>
                <div style={{ flex: 1, height: '1px', background: '#334155', margin: '0 8px' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748B', marginRight: '8px' }} />
                <span>{truck.route.destination}</span>
              </div>
            </div>

            {truck.incidents > 0 && (
              <div style={{ padding: '0 16px 14px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#EF4444', marginBottom: '8px', fontWeight: 'bold' }}>ÚLTIMO INCIDENTE</div>
                <div style={{ background: '#1E293B', borderLeft: '2px solid #EF4444', borderRadius: '0 8px 8px 0', padding: '12px' }}>
                  <div style={{ color: '#E2E8F0', fontSize: '12px', marginBottom: '6px' }}>Robo confirmado por Genlayer</div>
                  <div style={{
                    display: 'inline-block', fontSize: '10px', background: '#450a0a',
                    color: '#EF4444', padding: '2px 6px', borderRadius: '4px', marginBottom: '10px', fontWeight: 'bold',
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
                Ver detalle completo →
              </button>
              <button
                onClick={() => router.push('/events')}
                style={{ background: 'transparent', border: '0.5px solid #334155', color: '#94A3B8', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                Ver eventos →
              </button>
            </div>
          </div>
        )
      })()}

      {/* Right fleet status panel */}
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
              onClick={() => { setSelectedTruck(truck); setDetailPanel(truck) }}
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
              <div style={{ fontSize: '10px', color: '#64748B' }}>{truck.driver.name}</div>
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{truck.cargo.description}</div>
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
