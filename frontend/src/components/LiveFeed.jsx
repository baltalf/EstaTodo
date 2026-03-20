/**
 * Placeholder para feed de video en vivo.
 * Día 1: área visual; el backend no expone stream de frames aún.
 */
export function LiveFeed() {
  return (
    <div className="relative w-full aspect-video bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
      <div className="text-center text-zinc-500">
        <div className="text-4xl mb-2">📹</div>
        <p className="text-sm">Feed en vivo</p>
        <p className="text-xs mt-1">Conectando al detector...</p>
      </div>
    </div>
  );
}
