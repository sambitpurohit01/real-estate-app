import api from './axios';

export const agentService = {
  // history: array of { role: 'user'|'assistant', content: string } (no system messages —
  // the backend owns the system prompt). Works for guests too; the backend attaches
  // the logged-in user automatically via the same JWT the rest of the app uses.
  chat: (message, history) =>
    api.post('/api/agent/chat', { message, history }).then((res) => res.data),
};
