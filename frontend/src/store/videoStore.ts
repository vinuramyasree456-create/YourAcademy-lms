import { create } from 'zustand';
import apiClient from '../apiClient';

interface VideoState {
  currentVideoId: number | null;
  lastPositionSeconds: number;
  isCompleted: boolean;
  nextVideoId: number | null;
  prevVideoId: number | null;
  fetchProgress: (videoId: number) => Promise<void>;
  markCompleted: (videoId: number) => Promise<void>;
}

const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  lastPositionSeconds: 0,
  isCompleted: false,
  nextVideoId: null,
  prevVideoId: null,
  
  fetchProgress: async (videoId: number) => {
    try {
      const { data } = await apiClient.get(`/progress/videos/${videoId}`);
      set({
        currentVideoId: videoId,
        lastPositionSeconds: data.lastPositionSeconds || 0,
        isCompleted: data.isCompleted || false,
      });
    } catch {
      set({ currentVideoId: videoId, lastPositionSeconds: 0, isCompleted: false });
    }
  },

  markCompleted: async (videoId: number) => {
    try {
      await apiClient.post(`/progress/videos/${videoId}`, { isCompleted: true });
      set({ isCompleted: true });
    } catch (e) {
      console.error(e);
    }
  }
}));

export default useVideoStore;
