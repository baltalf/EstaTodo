import React from 'react';

export default function DispatchPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="mb-8 border-b border-zinc-800 pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono tracking-tighter">SAFEGUARD<span className="text-purple-500">_</span>DISPATCH</h1>
        <nav className="flex gap-4 text-sm font-mono">
          <a href="/fleet" className="text-zinc-400 hover:text-white transition-colors">/fleet</a>
          <a href="/dispatch" className="text-purple-400 font-bold border-b border-purple-500">/dispatch</a>
          <a href="/live-map" className="text-zinc-400 hover:text-white transition-colors">/live-map</a>
        </nav>
      </header>
      
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-2xl mx-auto shadow-2xl">
          <h2 className="text-xl font-bold mb-6">Assign Cargo to Trip</h2>
          
          <form className="space-y-4">
              <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400 font-mono">Select Fleet Asset (Truck)</label>
                  <select className="bg-zinc-950 border border-zinc-700 rounded p-2 text-white">
                      <option>Truck #1042 (BA -> Rosario)</option>
                      <option>Truck #3098 (Cordoba -> BA)</option>
                  </select>
              </div>
              
              <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400 font-mono">Invoice / Remito ID</label>
                  <input type="text" placeholder="REM-2024-XXXX" className="bg-zinc-950 border border-zinc-700 rounded p-2 text-white" />
              </div>

              <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400 font-mono">Cargo Declared Value (USD)</label>
                  <input type="number" placeholder="150000" className="bg-zinc-950 border border-zinc-700 rounded p-2 text-white" />
              </div>
              
              <button type="button" className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center">
                  Lock Manifest & Authorize Trip
              </button>
              <p className="text-center text-xs text-zinc-500 mt-2">
                  This action immutably ties the cargo value to the CameraID for Genlayer dispute escalation.
              </p>
          </form>
      </div>
    </div>
  );
}
