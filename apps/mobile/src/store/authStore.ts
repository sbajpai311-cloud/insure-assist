import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'insure_assist_token';
const AGENT_KEY = 'insure_assist_agent';

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
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  agent: null,
  isAuthenticated: false,

  setToken: (token) => {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {/* ignore */});
    set({ token, isAuthenticated: true });
  },

  setAgent: (agent) => {
    SecureStore.setItemAsync(AGENT_KEY, JSON.stringify(agent)).catch(() => {/* ignore */});
    set({ agent });
  },

  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {/* ignore */});
    SecureStore.deleteItemAsync(AGENT_KEY).catch(() => {/* ignore */});
    set({ token: null, agent: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const [token, agentRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(AGENT_KEY),
      ]);
      if (token) {
        const agent = agentRaw ? JSON.parse(agentRaw) : null;
        set({ token, agent, isAuthenticated: true });
      }
    } catch {
      // If hydration fails, stay logged out — user will need to log in
    }
  },
}));
