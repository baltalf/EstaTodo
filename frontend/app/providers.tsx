'use client';
import { useWebSocket } from '@/lib/websocket';

export default function Providers({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return <>{children}</>;
}
