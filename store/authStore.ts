import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  fullName?: string;
  email?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  hasPin: boolean;
  user: User | null;
  loading: boolean;
  isVerified: boolean;

  setAccessToken: (authToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setHasPin: (hasPin: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsVerified: (isVerified: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      hasPin: false,
      user: null,
      loading: false,
      isVerified: false,

      setAccessToken: (value) => set({ accessToken: value }),
      setRefreshToken: (value) => set({ refreshToken: value }),
      setHasPin: (value) => set({ hasPin: value }),
      setUser: (value) => set({ user: value }),
      setLoading: (value) => set({ loading: value }),
      setIsVerified: (value) => set({ isVerified: value }),
    }),
    {
      name: 'auth-storage', // 🔑 key in localStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        hasPin: state.hasPin,
        isVerified: state.isVerified,
      }), // only persist what you want
    }
  )
);
