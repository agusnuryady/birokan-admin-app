import { create } from 'zustand';
import {
  getVouchers,
  GetVouchersQueryParams,
  PaginatedResponse,
  VoucherResponse,
} from '@/services/voucherService';
import { notifyApiError } from '@/utils/handleApiError';

interface VoucherState {
  vouchers: VoucherResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: GetVouchersQueryParams;
  search: string;
  optionsDefaultValue: string[] | [];
  setSearch: (value: string) => void;
  fetchVouchers: (query?: Partial<GetVouchersQueryParams>) => Promise<void>;
}

export const useVoucherStore = create<VoucherState>((set, get) => ({
  vouchers: [],
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
  optionsDefaultValue: [],
  setSearch: (value) => set({ search: value }),

  fetchVouchers: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<VoucherResponse> = await getVouchers(merged);

      const defaultOptions: string[] = res.data.map((item) => item.discountType);

      set((val) => ({
        vouchers: res.data,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        page: res.pagination.page,
        limit: res.pagination.limit,
        query: merged,
        optionsDefaultValue: Array.from(new Set([...val.optionsDefaultValue, ...defaultOptions])),
      }));
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      set({ loading: false });
    }
  },
}));
