import { create } from 'zustand';

/**
 * Zustand store para SafeGuard AI
 * - module: FACTORY | CARGO
 * - events: lista de eventos en tiempo real
 * - wsConnected: estado WebSocket
 */
export const useAppStore = create((set, get) => ({
  module: 'FACTORY',
  events: [],
  wsConnected: false,

  setModule: (module) => set({ module: module.toUpperCase() }),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  toggleModule: () => {
    const next = get().module === 'FACTORY' ? 'CARGO' : 'FACTORY';
    set({ module: next });
    return next;
  },
}));
