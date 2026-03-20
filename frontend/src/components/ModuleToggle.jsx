import { useState } from 'react';
import { useAppStore } from '../store/appStore';

const API_BASE = 'http://localhost:8000';

/**
 * Switch animado naranja (FACTORY) / azul (CARGO)
 */
export function ModuleToggle() {
  const { module, setModule } = useAppStore();
  const [loading, setLoading] = useState(false);

  const isFactory = module === 'FACTORY';

  const handleToggle = async () => {
    setLoading(true);
    const next = isFactory ? 'CARGO' : 'FACTORY';
    try {
      const res = await fetch(`${API_BASE}/api/module/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: next }),
      });
      const data = await res.json();
      if (data.module) setModule(data.module);
    } catch (err) {
      console.error('Module toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`
        relative w-32 h-14 rounded-full transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900
        ${isFactory ? 'bg-amber-500 focus:ring-amber-500' : 'bg-blue-600 focus:ring-blue-600'}
      `}
    >
      <span
        className={`
          absolute top-1.5 w-11 h-11 rounded-full bg-white shadow-lg
          transition-transform duration-300 ease-out
          ${isFactory ? 'left-1.5' : 'left-[4.5rem]'}
        `}
      />
      <span className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        <span className={`text-xs font-bold ${isFactory ? 'text-amber-900' : 'text-zinc-400'}`}>
          FACTORY
        </span>
        <span className={`text-xs font-bold ${!isFactory ? 'text-blue-100' : 'text-zinc-400'}`}>
          CARGO
        </span>
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
