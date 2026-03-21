import React from 'react';
import ModuloDMap from '@/components/Map';

export default function LiveMapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono tracking-tighter">SAFEGUARD<span className="text-red-500">_</span>ORCHESTRATOR</h1>
        <nav className="flex gap-4 text-sm font-mono">
          <a href="/fleet" className="text-zinc-400 hover:text-white transition-colors">/fleet</a>
          <a href="/dispatch" className="text-zinc-400 hover:text-white transition-colors">/dispatch</a>
          <a href="/live-map" className="text-red-400 font-bold border-b border-red-500">/live-map</a>
        </nav>
      </header>
      <ModuloDMap />
    </div>
  );
}
