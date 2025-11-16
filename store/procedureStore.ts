import { create } from 'zustand';
import {
  getProcedureDropdown,
  getProcedures,
  PaginatedResponse,
  ProcedureDropdownResponse,
  ProcedureQuery,
  ProcedureResponse,
} from '@/services/procedureService';
import { notifyApiError } from '@/utils/handleApiError';

interface ProcedureState {
  procedures: ProcedureResponse[];
  dropdown: ProcedureDropdownResponse;
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: ProcedureQuery;
  searchProcedures: string;
  setSearchProcedures: (value: string) => void;
  fetchProcedures: (query?: Partial<ProcedureQuery>) => Promise<void>;
  fetchDropdown: () => Promise<void>;
}

export const useProcedureStore = create<ProcedureState>((set, get) => ({
  procedures: [],
  dropdown: { directory: [], documents: [], places: [], stepGroup: [] },
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
  searchProcedures: '',
  setSearchProcedures: (value) => {
    set({ searchProcedures: value });
  },
  fetchProcedures: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<ProcedureResponse> = await getProcedures(merged);

      set({
        procedures: res.data,
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
  fetchDropdown: async () => {
    set({ loading: true });
    try {
      const res: ProcedureDropdownResponse = await getProcedureDropdown();

      set({
        dropdown: res,
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      set({ loading: false });
    }
  },
}));
