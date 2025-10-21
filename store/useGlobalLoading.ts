import { create } from 'zustand';

interface GlobalLoadingState {
  visible: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useGlobalLoading = create<GlobalLoadingState>((set) => ({
  visible: false,
  showLoading: () => set({ visible: true }),
  hideLoading: () => set({ visible: false }),
}));
