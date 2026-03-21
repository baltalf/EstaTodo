'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SGEvent } from '@/lib/types';

export default function DemoPage() {
  const [events, setEvents] = useState<SGEvent[]>([]);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const latestEvent = events.length > 0 ? events[0] : null;
  const isDetected = events.length > 0;
  const isBlockchainConfirmed = latestEvent?.blockchain_status === 'confirmed';
  const hasVerdict = !!latestEvent?.genlayer_verdict;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0f14', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Esta Todo <span style={{ color: '#f59e0b', WebkitTextFillColor: '#f59e0b' }}>Demo</span>
          </h1>
          <p style={{ fontSize: 18, color: '#a1a1aa', marginTop: 12 }}>
            Auditoría laboral inmutable con IA + Blockchain en tiempo real.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60 }}>
          
          {/* Left Column: Flow */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30, color: '#f59e0b' }}>Flujo del Sistema</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Step 1 */}
              <div style={{ 
                padding: 24, 
                borderRadius: 16, 
                backgroundColor: '#161925', 
                border: `1px solid ${isDetected ? '#10b981' : '#272a38'}`,
                position: 'relative',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: isDetected ? '#10b981' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 }}>1</div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Edge AI detecta el incidente</h3>
                  </div>
                  {isDetected && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, padding: '4px 10px', backgroundColor: '#272a38', borderRadius: 20, color: '#a1a1aa', fontWeight: 600 }}>
                    YOLOv8 + OpenCV
                  </span>
                </div>
                <p style={{ margin: 0, color: '#a1a1aa', fontSize: 15 }}>Cámara CCTV detecta movimiento sospechoso en tiempo real.</p>
                {isDetected && latestEvent && (
                  <div style={{ marginTop: 16 }}>
                    <button 
                      onClick={() => setShowVideo(true)}
                      style={{ padding: '8px 16px', backgroundColor: '#272a38', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                    >
                      ▶ Ver evidencia
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div style={{ 
                padding: 24, 
                borderRadius: 16, 
                backgroundColor: '#161925', 
                border: `1px solid ${isBlockchainConfirmed ? '#10b981' : '#272a38'}`,
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: isBlockchainConfirmed ? '#10b981' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 }}>2</div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Hash registrado en Avalanche</h3>
                  </div>
                  {isBlockchainConfirmed && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, padding: '4px 10px', backgroundColor: '#272a38', borderRadius: 20, color: '#a1a1aa', fontWeight: 600 }}>
                    Avalanche Subnet · Chain ID 99372
                  </span>
                </div>
                {isBlockchainConfirmed && latestEvent?.blockchain_tx ? (
                  <div>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: 15, marginBottom: 8 }}>Evidencia inmutable asegurada en L1.</p>
                    <a href={`https://subnets.avax.network/tx/${latestEvent.blockchain_tx}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#f59e0b', textDecoration: 'none', fontFamily: 'monospace' }}>
                      TX: {latestEvent.blockchain_tx.substring(0, 24)}...
                    </a>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#4b5563', fontSize: 15 }}>Esperando registro en blockchain...</p>
                )}
              </div>

              {/* Step 3 */}
              <div style={{ 
                padding: 24, 
                borderRadius: 16, 
                backgroundColor: '#161925', 
                border: `1px solid ${hasVerdict ? '#10b981' : '#272a38'}`,
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: hasVerdict ? '#10b981' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 }}>3</div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Genlayer emite veredicto</h3>
                  </div>
                  {hasVerdict && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, padding: '4px 10px', backgroundColor: '#272a38', borderRadius: 20, color: '#a1a1aa', fontWeight: 600 }}>
                    Genlayer · LLM Consensus
                  </span>
                </div>
                {hasVerdict ? (
                  <div>
                    <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: 24, fontWeight: 900, textTransform: 'uppercase' }}>
                      {latestEvent.genlayer_verdict?.replace('_', ' ')}
                    </h4>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: 14 }}>Veredicto autónomo y auditable vía Smart Contracts inteligentes.</p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#4b5563', fontSize: 15 }}>Esperando consenso de IA...</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30, color: '#f59e0b' }}>Impacto Inmediato</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
              <div style={{ backgroundColor: '#161925', padding: 24, borderRadius: 16, border: '1px solid #272a38' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>$2.1M <span style={{fontSize: 20}}>USD</span></div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.4 }}>Valor promedio robado por año por empresa en Argentina.</div>
              </div>
              <div style={{ backgroundColor: '#161925', padding: 24, borderRadius: 16, border: '1px solid #272a38' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#10b981', marginBottom: 8 }}>47 <span style={{fontSize: 20}}>min</span></div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.4 }}>Tiempo de resolución promedio con Esta Todo (vs. 6 meses).</div>
              </div>
              <div style={{ backgroundColor: '#161925', padding: 24, borderRadius: 16, border: '1px solid #272a38' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>100%</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.4 }}>Evidencia inmutable con 0% de posibilidades de alteración.</div>
              </div>
              <div style={{ backgroundColor: '#161925', padding: 24, borderRadius: 16, border: '1px solid #272a38' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>3</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.4 }}>Blockchains integradas: Avalanche L1, Genlayer e IPFS.</div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Link href="/live-map" style={{
                display: 'block',
                width: '100%',
                padding: '24px',
                backgroundColor: '#f59e0b',
                color: '#000',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 20,
                fontWeight: 800,
                borderRadius: 16,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                VER DEMO EN VIVO →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: '#161925', padding: 20, borderRadius: 16, maxWidth: 800, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Evidencia del Incidente</h3>
              <button 
                onClick={() => setShowVideo(false)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: 24, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <video 
              src="http://localhost:8001/api/media/video_robo.mp4" 
              controls 
              autoPlay 
              style={{ width: '100%', borderRadius: 8, border: '1px solid #272a38' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
