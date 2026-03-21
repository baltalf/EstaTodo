'use client'
import Link from 'next/link'

export default function CheckoutFailurePage() {
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
        border: '0.5px solid #EF4444',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* Red X */}
        <div style={{
          width: 80, height: 80, background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', border: '2px solid #EF4444'
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F1F5F9', marginBottom: '12px' }}>
          Hubo un problema con el pago
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '32px' }}>
          Tu tarjeta fue rechazada o cancelaste la operación. No se realizó ningún cargo.
        </p>

        <Link href="/checkout" style={{
          display: 'inline-block',
          background: '#1E293B',
          color: '#F1F5F9',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'all 0.2s'
        }}>
          Intentar de nuevo
        </Link>
      </div>
    </div>
  )
}
