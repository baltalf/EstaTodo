'use client'
import Link from 'next/link'

export default function CheckoutPendingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080e1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: '#0F172A',
        border: '0.5px solid #F59E0B',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* Amber Clock */}
        <div style={{
          width: 80, height: 80, background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', border: '2px solid #F59E0B'
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F1F5F9', marginBottom: '12px' }}>
          Pago pendiente de confirmación
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '32px' }}>
          Si pagaste con un medio en efectivo (como Rapipago o Pago Fácil), puede demorar hasta 48hs hábiles. Te notificaremos cuando se acredite.
        </p>

        <Link href="/live-map" style={{
          display: 'inline-block',
          background: '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
