import { TRUCKS, CHECKPOINTS } from '@/lib/types';
import FleetDetail from '@/components/fleet/FleetDetail';

// Next.js 15: params is a Promise in both Server and Client Components
export default async function FleetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const truck = TRUCKS.find((t) => t.id === id);

  if (!truck) {
    return (
      <div style={{ padding: 40, color: 'var(--danger)', fontFamily: "'IBM Plex Mono', monospace" }}>
        Camión no encontrado: {id}
      </div>
    );
  }

  const routeKey = `${truck.route.origin}-${truck.route.destination}`;
  const checkpoints = CHECKPOINTS[routeKey] ?? [];

  return <FleetDetail truck={truck} checkpoints={checkpoints} />;
}
