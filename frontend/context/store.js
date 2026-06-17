import { create } from 'zustand';
import api from '../lib/api';

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,

  playSong: (song, queue = []) => {
    const idx = queue.findIndex((s) => s._id === song._id);
    set({ currentSong: song, queue, queueIndex: idx >= 0 ? idx : 0, isPlaying: true });
    api.post(`/songs/${song._id}/play`).catch(() => {});
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  playNext: () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1];
      set({ currentSong: next, queueIndex: queueIndex + 1, isPlaying: true });
    }
  },

  playPrev: () => {
    const { queue, queueIndex, progress } = get();
    if (progress > 3) {
      set({ progress: 0 });
    } else if (queueIndex > 0) {
      const prev = queue[queueIndex - 1];
      set({ currentSong: prev, queueIndex: queueIndex - 1, isPlaying: true });
    }
  },

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setVolume:   (v) => set({ volume: v }),
}));

export const useAuthStore = create((set) => ({
  user:      null,
  token:     null,
  isLoading: true,

  login: (token, user) => {
    localStorage.setItem('muzora_token', token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('muzora_token');
    set({ token: null, user: null });
    window.location.href = '/login';
  },

  initAuth: async () => {
    const token = localStorage.getItem('muzora_token');
    if (!token) return set({ isLoading: false });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, isLoading: false });
    } catch {
      localStorage.removeItem('muzora_token');
      set({ isLoading: false });
    }
  },
}));