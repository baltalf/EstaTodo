import { format } from 'date-fns';

const STATUS_COLORS = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  failed: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function EventCard({ event }) {
  const status = event.blockchain_status || 'pending';
  const statusClass = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const ts = event.timestamp ? new Date(event.timestamp) : new Date();

  return (
    <div className="p-3 rounded-lg bg-zinc-800/80 border border-zinc-700 hover:border-zinc-600 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm text-amber-400">{event.type}</span>
        <span className={`text-xs px-2 py-0.5 rounded border ${statusClass}`}>{status}</span>
      </div>
      <div className="mt-1 text-xs text-zinc-400">
        {event.module} · {event.camera_id || '-'}
      </div>
      <div className="mt-1 text-xs text-zinc-500">{format(ts, 'HH:mm:ss')}</div>
    </div>
  );
}
