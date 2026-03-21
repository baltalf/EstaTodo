'use client';
import React from 'react';
import Link from 'next/link';

// Inline style constants
const S = {
  page: {
    background: '#0F172A',
    minHeight: '100vh',
    color: '#F1F5F9',
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
    overflowX: 'hidden' as const,
  },
  section: {
    paddingTop: 80,
    paddingBottom: 80,
    paddingLeft: 24,
    paddingRight: 24,
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: '#F1F5F9',
    textAlign: 'center' as const,
    marginBottom: 48,
    fontFamily: 'var(--font-space), system-ui, sans-serif',
  },
  // Cards
  numCard: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '32px 24px',
  },
  numValue: {
    fontSize: 56,
    fontWeight: 800,
    color: '#F1F5F9',
    lineHeight: 1,
    marginBottom: 12,
    fontFamily: 'var(--font-space), system-ui, sans-serif',
  },
  numLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 500,
  },
  layerCard: {
    background: '#1E293B',
    border: '0.5px solid #334155',
    borderRadius: 12,
    padding: '28px 24px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },
  iconWrap: (color: string) => ({
    width: 40,
    height: 40,
    minWidth: 40,
    background: '#0F172A',
    borderRadius: 8,
    padding: 10,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
    color,
  }),
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#F1F5F9',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 1.6,
    flexGrow: 1,
    marginBottom: 20,
  },
  pill: {
    display: 'inline-block',
    background: '#0F172A',
    border: '0.5px solid #334155',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: '#F1F5F9',
    letterSpacing: '0.04em',
  },
  moduleCard: (borderColor: string) => ({
    background: '#1E293B',
    borderRadius: 12,
    padding: 32,
    border: `1.5px solid ${borderColor}`,
  }),
  moduleTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#F1F5F9',
    marginBottom: 8,
    fontFamily: 'var(--font-space), system-ui, sans-serif',
  },
  techPill: {
    background: '#1E293B',
    border: '0.5px solid #334155',
    borderRadius: 6,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#94A3B8',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#1E293B',
    border: '0.5px solid #334155',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    color: '#94A3B8',
  },
};

export default function LandingPage() {
  return (
    <div style={S.page}>
      {/* SECTION 1 — Hero */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          position: 'relative',
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(8,14,26,0.75) 0%,
              rgba(8,14,26,0.85) 60%,
              rgba(8,14,26,1) 100%
            ),
            url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}
          className="animate-fade-up"
        >
          {/* Logo */}
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-space), system-ui', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ fontWeight: 400, color: '#F1F5F9' }}>Esta</span>
            <span style={{ fontWeight: 700, color: '#2563EB' }}>Todo</span>
          </div>
          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: 24,
            fontFamily: 'var(--font-space), system-ui',
            background: 'linear-gradient(to right, #ffffff, #94A3B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Auditoría Antifraude Inmutable para Logística
          </h1>
          {/* Subtitle */}
          <p style={{ fontSize: 18, color: '#94A3B8', maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.6 }}>
            El primer sistema B2B que combina Edge AI, Avalanche L1 y Genlayer para eliminar el fraude en camiones y depósitos industriales en Argentina.
          </p>

          {/* Separator */}
          <div style={{ width: 64, height: 1, background: '#334155', margin: '0 auto 24px' }}></div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <span style={S.badge}><span style={{ color: '#06B6D4' }}>🔒</span> Evidencia inmutable en blockchain</span>
            <span style={S.badge}><span style={{ color: '#06B6D4' }}>🤖</span> IA descentralizada como juez</span>
            <span style={S.badge}><span style={{ color: '#EF4444' }}>⚡</span> Detección en tiempo real</span>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <Link href="/register" style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#2563EB',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
            >Comenzar gratis →</Link>
            <Link href="/demo" style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'transparent',
              color: '#06B6D4',
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #06B6D4',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>Ver demo en vivo</Link>
          </div>
        </div>

        {/* fade bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 80,
          background: 'linear-gradient(to top, #0F172A, transparent)',
          pointerEvents: 'none',
        }}></div>
      </section>

      {/* SECTION 2 — Números */}
      <section style={{ ...S.section, background: '#0F172A' }}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={S.sectionTitle}>El fraude logístico cuesta millones</h2>
            <p style={{ fontSize: 16, color: '#94A3B8', maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }}>
              Las empresas de logística en Argentina pierden mercadería sin poder probarlo. Los peritajes son caros, lentos y manipulables. Esta Todo cambia eso.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div style={{ ...S.numCard, backgroundImage: "linear-gradient(rgba(15,23,42,0.88), rgba(15,23,42,0.88)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ color: '#2563EB', marginBottom: 16 }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <div style={S.numValue}>$850M</div>
              <div style={S.numLabel}>pérdidas anuales por robo en logística Argentina</div>
            </div>
            <div style={{ ...S.numCard, backgroundImage: "linear-gradient(rgba(15,23,42,0.88), rgba(15,23,42,0.88)), url('https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ color: '#F59E0B', marginBottom: 16 }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div style={S.numValue}>6 meses</div>
              <div style={S.numLabel}>tiempo promedio para resolver una disputa sin evidencia</div>
            </div>
            <div style={{ ...S.numCard, backgroundImage: "linear-gradient(rgba(15,23,42,0.88), rgba(15,23,42,0.88)), url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ color: '#EF4444', marginBottom: 16 }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div style={S.numValue}>73%</div>
              <div style={S.numLabel}>de los robos internos nunca se prueban legalmente</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — 3 Capas */}
      <section style={{ ...S.section, background: '#0F172A', borderTop: '1px solid #334155' }}>
        <div style={S.container}>
          <h2 style={S.sectionTitle}>Tres capas de protección</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* Card 1 — Cámara */}
            <div style={{ ...S.layerCard, backgroundImage: "linear-gradient(rgba(15,23,42,0.92), rgba(15,23,42,0.92)), url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={S.iconWrap('#10B981')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <h3 style={S.cardTitle}>Detección automática</h3>
              <p style={S.cardText}>YOLOv8 monitorea las cámaras existentes 24/7. Detecta accesos no autorizados, manipulación de carga y comportamiento sospechoso en tiempo real.</p>
              <span style={S.pill}>YOLOv8 + OpenCV</span>
            </div>
            {/* Card 2 — Cadena */}
            <div style={{ ...S.layerCard, backgroundImage: "linear-gradient(rgba(15,23,42,0.92), rgba(15,23,42,0.92)), url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={S.iconWrap('#06B6D4')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <h3 style={S.cardTitle}>Evidencia inmutable</h3>
              <p style={S.cardText}>Cada evento genera un hash SHA-256 que se registra en nuestra L1 privada de Avalanche. Imposible de alterar, verificable por cualquier juez.</p>
              <span style={{ ...S.pill, borderColor: '#06B6D4' }}>Avalanche Subnet · PoA</span>
            </div>
            {/* Card 3 — Balanza */}
            <div style={{ ...S.layerCard, backgroundImage: "linear-gradient(rgba(15,23,42,0.92), rgba(15,23,42,0.92)), url('https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={S.iconWrap('#06B6D4')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
              </div>
              <h3 style={S.cardTitle}>Juez autónomo con IA</h3>
              <p style={S.cardText}>Cuando hay una disputa, Genlayer analiza la evidencia con consenso de LLMs descentralizados y emite un veredicto legal imparcial.</p>
              <span style={{ ...S.pill, borderColor: '#06B6D4' }}>Genlayer · LLM Consensus</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Módulos */}
      <section style={{ ...S.section, background: '#0F172A', borderTop: '1px solid #334155' }}>
        <div style={S.container}>
          <h2 style={S.sectionTitle}>Dos módulos, un problema resuelto</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Fábricas */}
            <div style={{ ...S.moduleCard('#2563EB'), padding: 0, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: '1 1 60%', padding: 32 }}>
                <h3 style={S.moduleTitle}>Fábricas & ARTs</h3>
                <p style={{ color: '#2563EB', fontSize: 15, fontWeight: 600, marginBottom: 28 }}>Elimina los juicios laborales falsos</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['Detección de caídas y accidentes', 'Verificación de uso de EPP', 'Hash inmutable como prueba pericial'].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#94A3B8', fontSize: 14 }}>
                      <span style={{ color: '#10B981', fontWeight: 700, marginTop: 1 }}>✓</span> {item}
                    </li>
                  ))}
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#94A3B8', fontSize: 14, flexWrap: 'wrap' }}>
                    <span style={{ color: '#10B981', fontWeight: 700, marginTop: 1 }}>✓</span>
                    Veredicto:&nbsp;
                    <code style={{ background: '#263548', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: '#F1F5F9' }}>ACCIDENTE_REAL</code>
                    &nbsp;o&nbsp;
                    <code style={{ background: '#263548', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: '#F1F5F9' }}>FRAUDE_SOSPECHOSO</code>
                  </li>
                </ul>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80"
                style={{ width: '40%', height: 'auto', minHeight: '100%', objectFit: 'cover', opacity: 0.6 }}
              />
            </div>
            {/* Logística */}
            <div style={{ ...S.moduleCard('#06B6D4'), padding: 0, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: '1 1 60%', padding: 32 }}>
                <h3 style={S.moduleTitle}>Logística & Camiones</h3>
                <p style={{ color: '#06B6D4', fontSize: 15, fontWeight: 600, marginBottom: 28 }}>Certifica cada entrega, elimina el robo interno</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['Monitoreo continuo del trailer', 'Detección de manipulación de carga', 'Evidencia en IPFS para disputas', 'Integración con reclamos de seguro'].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#94A3B8', fontSize: 14 }}>
                      <span style={{ color: '#10B981', fontWeight: 700, marginTop: 1 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80"
                style={{ width: '40%', height: 'auto', minHeight: '100%', objectFit: 'cover', opacity: 0.6 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Tech stack */}
      <section style={{ ...S.section, background: '#0F172A', borderTop: '1px solid #334155' }}>
        <div style={{ ...S.container, textAlign: 'center' }}>
          <h2 style={S.sectionTitle}>Construido con las mejores tecnologías</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {['YOLOv8', 'OpenCV', 'FastAPI', 'Avalanche', 'Genlayer', 'IPFS', 'Next.js'].map(tech => (
              <span key={tech} style={S.techPill}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — CTA */}
      <section style={{ 
        ...S.section, 
        borderTop: '1px solid #334155', 
        textAlign: 'center',
        backgroundImage: `
          linear-gradient(
            135deg,
            rgba(8,14,26,0.95) 0%,
            rgba(37,99,235,0.15) 50%,
            rgba(8,14,26,0.95) 100%
          ),
          url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div style={S.container}>
          <h2 style={{ ...S.sectionTitle, marginBottom: 40 }}>¿Listo para proteger tu operación?</h2>
          <Link href="/register" style={{
            display: 'inline-block',
            padding: '16px 40px',
            background: '#2563EB',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 8,
            textDecoration: 'none',
            marginBottom: 20,
            boxShadow: '0 0 30px rgba(37,99,235,0.3)',
          }}>Comenzar ahora — es gratis →</Link>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Sin tarjeta de crédito. Setup en menos de 1 hora.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 24px', background: '#0F172A', borderTop: '1px solid #334155' }}>
        <div style={{ ...S.container, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94A3B8', fontSize: 14 }}>
            <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 16, fontFamily: 'var(--font-space), system-ui' }}>
              Esta<span style={{ color: '#2563EB' }}>Todo</span>
            </span>
            <span>•</span>
            <span>Construido en Argentina 🇦🇷</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ label: 'Demo', href: '/demo' }, { label: 'Documentación', href: '#' }, { label: 'Contacto', href: '#' }].map(({ label, href }) => (
              <Link key={label} href={href} style={{ color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
