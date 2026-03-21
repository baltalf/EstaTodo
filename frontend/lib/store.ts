import { create } from 'zustand';
import { SGEvent, Incident } from './types';

interface EstaTodoStore {
  incidents: Incident[];
  wsConnected: boolean;
  addIncident: (event: SGEvent) => void;
  setWsConnected: (v: boolean) => void;
  updateEventVerdict: (id: string, verdict: string) => void;
}

export const useStore = create<EstaTodoStore>((set) => ({
  incidents: [],
  wsConnected: false,

  addIncident: (event) => set((state) => {
    const newIncident: Incident = {
      id: event.id,
      event,
      timeReceived: new Date().toISOString(),
    };
    return { incidents: [newIncident, ...state.incidents].slice(0, 50) };
  }),

  updateEventVerdict: (id, verdict) => set((state) => ({
    incidents: state.incidents.map((inc) =>
      inc.event.id === id ? { ...inc, event: { ...inc.event, genlayer_verdict: verdict } } : inc
    ),
  })),

  setWsConnected: (v) => set({ wsConnected: v }),
}));
