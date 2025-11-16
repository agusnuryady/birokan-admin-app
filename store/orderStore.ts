import { create } from 'zustand';
import {
  getOrders,
  GetOrdersQueryParams,
  OrderListItem,
  PaginatedResponse,
} from '@/services/orderService';
import { notifyApiError } from '@/utils/handleApiError';

interface OrderState {
  orders: OrderListItem[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;

  query: GetOrdersQueryParams;
  search: string;

  setSearch: (value: string) => void;
  fetchOrders: (query?: Partial<GetOrdersQueryParams>) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
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

  search: '',

  setSearch: (value) => set({ search: value }),

  fetchOrders: async (query) => {
    set({ loading: true });

    try {
      const merged = { ...get().query, ...query };

      const res: PaginatedResponse<OrderListItem> = await getOrders(merged);

      set({
        orders: res.data,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        page: res.pagination.page,
        limit: res.pagination.limit,
        query: merged,
      });
    } catch (error: any) {
      notifyApiError(error, 'Failed to load orders');
    } finally {
      set({ loading: false });
    }
  },
}));
