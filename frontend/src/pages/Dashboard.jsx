import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useEventStream } from '../hooks/useEventStream';
import { ModuleToggle } from '../components/ModuleToggle';
import { LiveFeed } from '../components/LiveFeed';
import { EventCard } from '../components/EventCard';

export function Dashboard() {
  const { module, events, wsConnected } = useAppStore();

  useEventStream();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    fetch(`${apiUrl}/api/module/`)
      .then((r) => r.json())
      .then((d) => d.module && useAppStore.getState().setModule(d.module))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">SafeGuard AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">
            {wsConnected ? '● Conectado' : '○ Desconectado'}
          </span>
          <ModuleToggle />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm text-zinc-400">Feed en vivo</div>
          <LiveFeed />
          <div className="mt-2 text-xs text-zinc-500">Módulo: {module}</div>
        </div>

        <div>
          <div className="mb-2 text-sm text-zinc-400">Eventos en tiempo real</div>
          <div className="space-y-2 max-h-[32rem] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">Sin eventos aún.</p>
            ) : (
              events.map((ev) => <EventCard key={ev.id || ev.timestamp} event={ev} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
