"use client";
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Using a mock public token. Real prod uses env.
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVmYXVsdC10b2tlbiIsImEiOiJjbHh6dTRvMm8wNWwzMmtxc2lzNHJhYTJuIn0.mock-token';

export default function ModuloDMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [dots, setDots] = useState<any[]>([]);
  const [selectedDot, setSelectedDot] = useState<any | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; 
    
    // Si falla por el token mock, logueará en consola pero dejaremos el overlay activo
    try {
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-58.3816, -34.6037],
            zoom: 12
        });
    } catch(e) {
        console.warn("Mapbox Init error (likely invalid default token). UI overlay will still render.");
    }

    // Mock WebSocket simulation for incoming events from Avalanche/Modulo B
    const interval = setInterval(() => {
        const mockHash = "0x" + Math.random().toString(16).slice(2, 10);
        const newDot = {
            id: mockHash,
            lng: -58.3816 + (Math.random() - 0.5) * 0.1,
            lat: -34.6037 + (Math.random() - 0.5) * 0.1,
            time: new Date().toISOString(),
            cameraId: "CAM-LOG-001",
            cargoValue: "$250,000"
        };
        setDots(prev => [...prev, newDot]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-zinc-900 flex items-center justify-center">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Lateral Panel simulating incoming streams */}
      <div className="absolute top-4 left-4 z-10 bg-black/90 p-4 rounded-lg text-white border border-red-500/50 w-80 shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-red-500">Live Incident Map</h2>
        <p className="text-sm text-gray-400">Orquestador SafeGuard. Escuchando hashes de Avalanche...</p>
        
        <div className="mt-4 flex flex-col gap-2 max-h-96 overflow-y-auto">
            {dots.length === 0 && <p className="text-xs text-zinc-500">No hay incidencias en este momento.</p>}
            {dots.map((d, index) => (
                <div key={index} className="p-3 border border-red-500/50 rounded bg-red-900/10 cursor-pointer hover:bg-red-900/30 transition-colors" onClick={() => setSelectedDot(d)}>
                    <div className="font-mono text-xs text-red-400 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Avalanche TX Inserted
                    </div>
                    <div className="text-xs text-gray-300 mt-1">Hash: {d.id}</div>
                </div>
            ))}
        </div>
      </div>

      {/* Modal for "Incident Dot" */}
      {selectedDot && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-zinc-900 p-6 rounded-xl text-white border border-red-500/50 shadow-2xl w-96">
            <h3 className="text-lg font-bold text-red-500 mb-4 border-b border-red-500/20 pb-2">Detalles del Incidente</h3>
            <div className="flex flex-col gap-3 text-sm font-mono">
                <p><span className="text-gray-400">Timestamp:</span> <br/>{new Date(selectedDot.time).toLocaleString()}</p>
                <p><span className="text-gray-400">CameraID:</span> <br/>{selectedDot.cameraId}</p>
                <p><span className="text-gray-400">Avalanche Hash:</span> <br/>{selectedDot.id}</p>
                <p><span className="text-gray-400">Cargo Value:</span> <br/><span className="text-green-400 font-bold">{selectedDot.cargoValue}</span></p>
            </div>
            
            <button className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
               onClick={() => {
                   alert(`Disputa iniciada en Genlayer L1 para el hash: ${selectedDot.id}`);
                   setSelectedDot(null);
               }}>
                Escalate Dispute to Genlayer
            </button>
            <button className="mt-3 w-full text-xs text-gray-400 hover:text-white transition-colors" onClick={() => setSelectedDot(null)}>
                Cerrar Panel
            </button>
          </div>
      )}
    </div>
  );
}
