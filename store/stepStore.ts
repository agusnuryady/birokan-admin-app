import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import { getSteps, PaginatedResponse, StepQuery, StepResponse } from '@/services/stepService';

interface StepState {
  steps: StepResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: StepQuery;
  searchSteps: string;
  setSearchSteps: (value: string) => void;
  fetchSteps: (query?: Partial<StepQuery>) => Promise<void>;
}

export const useStepStore = create<StepState>((set, get) => ({
  steps: [],
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
  searchSteps: '',
  setSearchSteps: (value) => {
    set({ searchSteps: value });
  },
  fetchSteps: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<StepResponse> = await getSteps(merged);

      set({
        steps: res.data,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        page: res.pagination.page,
        limit: res.pagination.limit,
        query: merged,
      });
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      // console.log('error', error);
      if (error.response) {
        // Backend responded with error status
        if (error.response.data?.message) {
          errorMessage = error.response.data?.message;
        }
      }
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      set({ loading: false });
    }
  },
}));
