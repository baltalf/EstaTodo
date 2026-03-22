'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Si viene la info desde MP la procesamos
    // const paymentId = searchParams.get('payment_id')

    // Simulando activación 2 segundos
    const timer = setTimeout(() => {
      // Guardar plan actual en localStorage
      const tenant = JSON.parse(localStorage.getItem('estatodo_tenant') || '{}')
      localStorage.setItem('estatodo_tenant', JSON.stringify({ ...tenant, plan: 'pro', payment_status: 'approved' }))
      
      router.push('/live-map')
    }, 2500)

    return () => clearTimeout(timer)
  }, [router, searchParams])

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
        border: '0.5px solid #10B981',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* Animated Check */}
        <div style={{
          width: 80, height: 80, background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', border: '2px solid #10B981'
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F1F5F9', marginBottom: '12px' }}>
          ¡Pago aprobado!
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '32px' }}>
          Activando tu cuenta en Esta Todo. Estamos configurando tus módulos y llaves de acceso en la red L1...
        </p>

        {/* Spinner */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" strokeOpacity={0.25}></circle>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080e1a' }}></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
