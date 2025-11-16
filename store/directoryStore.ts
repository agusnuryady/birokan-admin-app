import { create } from 'zustand';
import {
  DirectoryQuery,
  DirectoryResponse,
  getDirectories,
  PaginatedResponse,
} from '@/services/directoryService';
import { notifyApiError } from '@/utils/handleApiError';

interface DirectoryState {
  directories: DirectoryResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: DirectoryQuery;
  searchDirectories: string;
  setSearchDirectories: (value: string) => void;
  fetchDirectories: (query?: Partial<DirectoryQuery>) => Promise<void>;
}

export const useDirectoryStore = create<DirectoryState>((set, get) => ({
  directories: [],
  total: 0,
  totalPages: 0,
  page: 1,
  limit: 10,
  loading: false,
  query: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
  },
  searchDirectories: '',
  setSearchDirectories: (value) => {
    set({ searchDirectories: value });
  },
  fetchDirectories: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<DirectoryResponse> = await getDirectories(merged);

      set({
        directories: res.data,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        page: res.pagination.page,
        limit: res.pagination.limit,
        query: merged,
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      set({ loading: false });
    }
  },
}));
