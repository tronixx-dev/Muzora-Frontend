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
  shuffle: false,
  repeat: false, // 'none' | 'one' | 'all'
  crossfade: false,
  showLyrics: false,

  playSong: (song, queue = []) => {
    const idx = queue.findIndex((s) => s._id === song._id);
    set({
      currentSong: song,
      queue,
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
      progress: 0,
    });
    api.post(`/songs/${song._id}/play`).catch(() => {});
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  playNext: () => {
    const { queue, queueIndex, shuffle, repeat, currentSong } = get();
    if (!queue.length) return;

    // Repeat one
    if (repeat === 'one') {
      set({ progress: 0 });
      return;
    }

    let nextIndex;

    if (shuffle) {
      // Pick random song that isn't current
      const others = queue.map((_, i) => i).filter((i) => i !== queueIndex);
      nextIndex = others[Math.floor(Math.random() * others.length)];
    } else {
      nextIndex = queueIndex + 1;
    }

    // End of queue
    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        // Radio/autoplay — reload queue from start
        set({ isPlaying: false });
        return;
      }
    }

    const next = queue[nextIndex];
    set({ currentSong: next, queueIndex: nextIndex, isPlaying: true, progress: 0 });
    api.post(`/songs/${next._id}/play`).catch(() => {});
  },

  playPrev: () => {
    const { queue, queueIndex, progress } = get();
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }
    if (queueIndex > 0) {
      const prev = queue[queueIndex - 1];
      set({ currentSong: prev, queueIndex: queueIndex - 1, isPlaying: true, progress: 0 });
      api.post(`/songs/${prev._id}/play`).catch(() => {});
    }
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
    })),

  toggleLyrics: () => set((s) => ({ showLyrics: !s.showLyrics })),

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setVolume:   (v) => set({ volume: v }),

  addToQueue: (song) => {
    const { queue } = get();
    if (!queue.find((s) => s._id === song._id)) {
      set({ queue: [...queue, song] });
    }
  },
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