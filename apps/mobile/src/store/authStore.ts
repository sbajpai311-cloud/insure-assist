import { create } from 'zustand';

interface Agent {
  agentId: string;
  name: string;
  email: string;
  tenantIds: string[];
}

interface AuthState {
  token: string | null;
  agent: Agent | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setAgent: (agent: Agent) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  agent: null,
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: true }),
  setAgent: (agent) => set({ agent }),
  logout: () => set({ token: null, agent: null, isAuthenticated: false }),
}));
