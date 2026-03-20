import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

const WS_URL = 'ws://localhost:8000/ws/stream';

/**
 * Hook WebSocket para eventos en tiempo real.
 * Conecta a /ws/stream y añade cada mensaje al store.
 */
export function useEventStream() {
  const { addEvent, setWsConnected } = useAppStore();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data);
        addEvent(event);
      } catch {
        // ignore
      }
    };

    return () => {
      ws.close();
      setWsConnected(false);
    };
  }, [addEvent, setWsConnected]);
}
