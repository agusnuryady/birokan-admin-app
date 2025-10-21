import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import {
  GetPlaceParams,
  getPlaces,
  PaginatedResponse,
  PlaceResponse,
} from '@/services/placeService';

interface PlaceState {
  places: PlaceResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: GetPlaceParams;
  searchPlaces: string;
  setSearchPlaces: (value: string) => void;
  fetchPlaces: (query?: Partial<GetPlaceParams>) => Promise<void>;
}

export const usePlaceStore = create<PlaceState>((set, get) => ({
  places: [],
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
  searchPlaces: '',

  setSearchPlaces: (value) => {
    set({ searchPlaces: value });
  },

  fetchPlaces: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<PlaceResponse> = await getPlaces(merged);

      set(() => ({
        places: res.data,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        page: res.pagination.page,
        limit: res.pagination.limit,
        query: merged,
      }));
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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
