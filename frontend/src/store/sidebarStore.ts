import { create } from 'zustand';
import apiClient from '../apiClient';

interface SubjectTree {
  id: number;
  title: string;
  sections: Section[];
}

interface Section {
  id: number;
  title: string;
  orderIndex: number;
  videos: VideoMeta[];
}

interface VideoMeta {
  id: number;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  locked: boolean;
}

interface SidebarState {
  tree: SubjectTree | null;
  loading: boolean;
  error: string | null;
  fetchTree: (subjectId: number) => Promise<void>;
  markVideoCompleted: (videoId: number) => void;
}

const useSidebarStore = create<SidebarState>((set, get) => ({
  tree: null,
  loading: false,
  error: null,
  fetchTree: async (subjectId: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiClient.get(`/subjects/${subjectId}/tree`);
      set({ tree: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tree', loading: false });
    }
  },
  markVideoCompleted: (videoId: number) => {
    const tree = get().tree;
    if (!tree) return;
    
    // Deep clone to trigger reactivity if needed, but simple update works in zustand mostly
    const newTree = { ...tree, sections: [...tree.sections] };
    
    for (const section of newTree.sections) {
      const videoIndex = section.videos.findIndex(v => v.id === videoId);
      if (videoIndex !== -1) {
        section.videos[videoIndex] = { ...section.videos[videoIndex], isCompleted: true };
        break;
      }
    }
    set({ tree: newTree });
  }
}));

export default useSidebarStore;
