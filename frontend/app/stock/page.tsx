'use client';
import React, { useState } from 'react';
import { TRUCKS, STOCK_ITEMS, formatARS } from '@/lib/types';

interface AssignedItem { name: string; value: number; qty: number; }

export default function StockPage() {
  const [selectedTruck, setSelectedTruck] = useState(TRUCKS[0].id);
  const [remito, setRemito] = useState('');
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);

  // Modal spec state
  const [assignModal, setAssignModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof STOCK_ITEMS[0] | null>(null);

  const catIcons: Record<string, string> = {
    'Electrónica': '📺', 'Electrodomésticos': '🏠', 'Informática': '💻',
  };

  const openAssign = (product: typeof STOCK_ITEMS[0]) => {
    setSelectedProduct(product);
    setQty(1);
    setAssignModal(true);
  };

  const submit = () => {
    if (!remito || !selectedProduct) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setAssignModal(false);
    }, 1500);
  };

  function stockBadge(available: number, qty: number) {
    if (available === 0) return (
      <span style={{ 
        background: '#450a0a', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', 
        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600
      }}>Sin stock</span>
    );
    if (available < qty) return (
      <span style={{ 
        background: '#0c1a35', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)', 
        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600
      }}>Asignado</span>
    );
    return (
      <span style={{ 
        background: '#052e16', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', 
        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600
      }}>Disponible</span>
    );
  }

  function getBarColor(available: number, qty: number) {
    if (available === 0) return '#EF4444';
    if (available < qty) return '#F59E0B';
    return '#10B981';
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Inventario</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {STOCK_ITEMS.length} productos · Valor total en bodega: {formatARS(STOCK_ITEMS.reduce((s, i) => s + i.value * i.qty, 0))}
          </p>
        </div>
        <button className="sg-btn sg-btn-primary">+ Agregar producto</button>
      </div>

      <div className="sg-card" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0F172A', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Producto</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>SKU</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Valor unit.</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Stock</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Estado</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {STOCK_ITEMS.map((item, i) => {
              const pct = item.qty > 0 ? (item.available / item.qty) * 100 : 0;
              const barColor = getBarColor(item.available, item.qty);
              const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(30,41,59,0.3)';

              return (
                <tr 
                  key={item.id} 
                  style={{ background: rowBg, borderBottom: '1px solid #334155', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#1E293B'}
                  onMouseOut={e => e.currentTarget.style.background = rowBg}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{catIcons[item.category] ?? '📦'}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#94A3B8' }}>{item.id}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 13 }}>{formatARS(item.value)}</span>
                  </td>
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 500 }}>{item.available}/{item.qty}</span>
                      <div style={{ height: 3, background: '#334155', borderRadius: 2, overflow: 'hidden', width: 60 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>{stockBadge(item.available, item.qty)}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {item.available > 0 ? (
                      <button 
                        onClick={() => openAssign(item)}
                        style={{
                          background: 'transparent',
                          border: '0.5px solid #2563EB',
                          color: '#2563EB',
                          fontSize: 11,
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2563EB'; }}
                      >
                        Asignar
                      </button>
                    ) : (
                      <button 
                        disabled
                        style={{
                          background: 'transparent',
                          border: '0.5px solid #334155',
                          color: '#64748B',
                          fontSize: 11,
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: 'not-allowed'
                        }}
                      >
                        Asignar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal asignación */}
      {assignModal && selectedProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setAssignModal(false)}>
          <div style={{
            background: '#0F172A', border: '0.5px solid #334155',
            borderRadius: 16, padding: 0, width: 480,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div style={{
              background: '#1E293B', borderRadius: '16px 16px 0 0',
              padding: '16px 24px', borderBottom: '0.5px solid #334155',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>Asignar a viaje</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{selectedProduct.name}</div>
              </div>
              <button 
                onClick={() => setAssignModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 20 }}
                onMouseOver={e => e.currentTarget.style.color = '#F1F5F9'}
                onMouseOut={e => e.currentTarget.style.color = '#64748B'}
              >✕</button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: 24 }}>
              
              {/* Card Producto Seleccionado */}
              <div style={{
                background: '#1E293B', border: '0.5px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ fontSize: 24 }}>{catIcons[selectedProduct.category] ?? '📦'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{selectedProduct.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'IBM Plex Mono',monospace" }}>{selectedProduct.id}</div>
                </div>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4',
                  padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600
                }}>
                  {selectedProduct.available} disponibles
                </div>
              </div>

              {/* Formulario */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Camión</label>
                  <select className="sg-input" value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 6, color: '#F1F5F9' }}>
                    {TRUCKS.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.driver.name}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#64748B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>N° Remito</label>
                    <input className="sg-input" placeholder="R-2024-XXX" value={remito} onChange={(e) => setRemito(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 6, color: '#F1F5F9' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#64748B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Cantidad</label>
                    <input className="sg-input" type="number" min={1} max={selectedProduct.available} value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '10px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 6, color: '#F1F5F9' }} />
                  </div>
                </div>

                <div style={{ height: '1px', background: '#334155', margin: '8px 0' }} />

                <button style={{ 
                  background: saved ? '#10B981' : '#2563EB', color: 'white', width: '100%', 
                  padding: '12px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', transition: '0.2s'
                }} onClick={submit}
                  onMouseOver={e => { if (!saved) e.currentTarget.style.background = '#1D4ED8'; }}
                  onMouseOut={e => { if (!saved) e.currentTarget.style.background = '#2563EB'; }}
                >
                  {saved ? 'Producto asignado correctamente ✓' : '+ Agregar a carga'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
