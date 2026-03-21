import React from 'react';

export default function FleetPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="mb-8 border-b border-zinc-800 pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono tracking-tighter">SAFEGUARD<span className="text-blue-500">_</span>FLEET</h1>
        <nav className="flex gap-4 text-sm font-mono">
          <a href="/fleet" className="text-blue-400 font-bold border-b border-blue-500">/fleet</a>
          <a href="/dispatch" className="text-zinc-400 hover:text-white transition-colors">/dispatch</a>
          <a href="/live-map" className="text-zinc-400 hover:text-white transition-colors">/live-map</a>
        </nav>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-bold mb-2">Truck #1042</h2>
              <p className="text-sm text-zinc-400 mb-4">Conductor: Juan Pérez</p>
              <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-zinc-500">Camera Status</span>
                      <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-zinc-500">Avalanche Access</span>
                      <span className="text-emerald-400">WHITELISTED</span>
                  </div>
                  <div className="flex justify-between pt-2">
                      <span className="text-zinc-500">Assigned Route</span>
                      <span>BA -> Rosario</span>
                  </div>
              </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-bold mb-2">Truck #3098</h2>
              <p className="text-sm text-zinc-400 mb-4">Conductor: Carlos Silva</p>
              <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-zinc-500">Camera Status</span>
                      <span className="text-amber-400">WARNING (Low Power)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-zinc-500">Avalanche Access</span>
                      <span className="text-emerald-400">WHITELISTED</span>
                  </div>
                  <div className="flex justify-between pt-2">
                      <span className="text-zinc-500">Assigned Route</span>
                      <span>Cordoba -> BA</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
