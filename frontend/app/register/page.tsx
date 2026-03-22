'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SECTORES = ['Logística', 'Manufactura', 'Retail', 'Alimentación', 'Farmacéutica', 'Otro'];
const PLANES = ['trial', 'pro', 'enterprise'] as const;

const S = {
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    background: '#0F172A',
    border: '0.5px solid #334155',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#F1F5F9',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
    transition: 'border-color 0.2s',
  },
  fieldGroup: { marginBottom: 16 },
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    cuit: '',
    empresa: '',
    sector: 'Logística',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [focusField, setFocusField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.cuit || !form.empresa) {
      setStatus({ type: 'error', msg: 'Completá todos los campos obligatorios.' });
      return;
    }
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.from('tenants').insert([{
      nombre_completo: form.nombre,
      email: form.email,
      cuit: form.cuit,
      empresa: form.empresa,
      sector: form.sector,
      plan: 'trial',
    }]);

    if (error) {
      setLoading(false);
      if (error.code === '23505') {
        setStatus({ type: 'error', msg: 'Este email ya tiene una cuenta. ¿Querés iniciar sesión?' });
      } else {
        setStatus({ type: 'error', msg: error.message || 'Error al crear la cuenta. Intentá nuevamente.' });
      }
      return;
    }

    // Save to localStorage
    localStorage.setItem('estatodo_tenant', JSON.stringify({
      empresa: form.empresa,
      email: form.email,
      plan: 'trial',
    }));

    setStatus({ type: 'success', msg: '¡Cuenta creada! Elegí tu plan...' });
    setTimeout(() => router.push('/pricing'), 1500);
  };

  const inputStyle = (name: string) => ({
    ...S.input,
    borderColor: focusField === name ? '#2563EB' : '#334155',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>

      {/* LEFT PANEL — 40% */}
      <div style={{
        width: '40%',
        minWidth: 340,
        backgroundImage: `
          linear-gradient(
            135deg,
            rgba(15,23,42,0.9) 0%,
            rgba(30,41,59,0.85) 100%
          ),
          url('https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRight: '0.5px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-space), system-ui' }}>
            <span style={{ color: '#F1F5F9', fontWeight: 400 }}>Esta</span>
            <span style={{ color: '#2563EB', fontWeight: 700 }}>Todo</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3, margin: 0 }}>
            Empezá a proteger<br />tu operación hoy
          </h2>
        </div>

        {/* Bullets */}
        <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            'Detecta fraudes con IA en tiempo real',
            'Evidencia inmutable en blockchain',
            'Veredictos sin intervención humana',
          ].map(text => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 20, height: 20, minWidth: 20, borderRadius: 6,
                background: '#172554', border: '1px solid #2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
              }}>
                <svg width="11" height="11" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Testimonio */}
        <div style={{
          background: '#1E293B',
          borderLeft: '3px solid #06B6D4',
          borderRadius: 8,
          padding: 16,
        }}>
          <p style={{ fontStyle: 'italic', color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>
            "En 3 semanas eliminamos el 100% de las discrepancias entre lo que carga el camión y lo que llega al depósito."
          </p>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#06B6D4' }}>
            — Martín Rodríguez, CEO Logística del Norte
          </div>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 40, fontSize: 12, color: '#64748B' }}>
          Setup en menos de 1 hora · Sin tarjeta de crédito
        </p>
      </div>

      {/* RIGHT PANEL — 60% */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 50%),
          #0F172A
        `,
      }}>
        {/* Form card */}
        <div style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(30,41,59,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '0.5px solid #334155',
          borderRadius: 16,
          padding: 40,
          position: 'relative',
          zIndex: 1,
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>
            Crear cuenta gratuita
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>
            Plan Trial activo por 14 días. Sin límite de eventos.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Nombre completo */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Nombre completo *</label>
              <input
                name="nombre" value={form.nombre} onChange={handleChange} type="text"
                placeholder="Juan García"
                style={inputStyle('nombre')}
                onFocus={() => setFocusField('nombre')}
                onBlur={() => setFocusField(null)}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Email empresarial *</label>
              <input
                name="email" value={form.email} onChange={handleChange} type="email"
                placeholder="juan@empresa.com"
                style={inputStyle('email')}
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                autoComplete="email"
              />
            </div>

            {/* Empresa + CUIT row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={S.label}>Empresa *</label>
                <input
                  name="empresa" value={form.empresa} onChange={handleChange} type="text"
                  placeholder="Mi Empresa S.A."
                  style={inputStyle('empresa')}
                  onFocus={() => setFocusField('empresa')}
                  onBlur={() => setFocusField(null)}
                />
              </div>
              <div>
                <label style={S.label}>CUIT *</label>
                <input
                  name="cuit" value={form.cuit} onChange={handleChange} type="text"
                  placeholder="30-12345678-9"
                  style={inputStyle('cuit')}
                  onFocus={() => setFocusField('cuit')}
                  onBlur={() => setFocusField(null)}
                />
              </div>
            </div>

            {/* Sector */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Sector</label>
              <select
                name="sector" value={form.sector} onChange={handleChange}
                style={{ ...inputStyle('sector'), cursor: 'pointer' }}
                onFocus={() => setFocusField('sector')}
                onBlur={() => setFocusField(null)}
              >
                {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Status message */}
            {status && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                lineHeight: 1.5,
                background: status.type === 'error' ? 'rgba(127,29,29,0.4)' : 'rgba(5,46,22,0.5)',
                border: `1px solid ${status.type === 'error' ? '#7f1d1d' : '#14532d'}`,
                color: status.type === 'error' ? '#FCA5A5' : '#86EFAC',
              }}>
                {status.msg}
                {status.type === 'error' && status.msg.includes('iniciar sesión') && (
                  <Link href="/live-map" style={{ color: '#06B6D4', marginLeft: 6, textDecoration: 'underline' }}>
                    Ir al dashboard
                  </Link>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 14,
                background: loading ? '#1E3A8A' : '#2563EB',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 8,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity={0.3} />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Creando tu cuenta...
                </>
              ) : 'Crear cuenta gratuita →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', margin: 0 }}>
              ¿Ya tenés cuenta?{' '}
              <Link href="/live-map" style={{ color: '#06B6D4', textDecoration: 'none' }}>
                Ir al dashboard
              </Link>
            </p>
          </form>
        </div>

        {/* Decorative corner accent */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 300, height: 300,
          background: 'radial-gradient(ellipse at top right, rgba(37,99,235,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #475569; }
        select option { background: #1E293B; color: #F1F5F9; }
      `}</style>
    </div>
  );
}
