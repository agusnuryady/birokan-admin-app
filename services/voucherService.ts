import { VoucherFormValues } from '@/app/(app)/vouchers/_components/VoucherFormModal';
import api from '@/lib/axios';

export interface VoucherResponse {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isVisible: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface GetVouchersQueryParams {
  search?: string;
  isActive?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED';
  page?: number;
  limit?: number;
  sortBy?: 'code' | 'title' | 'discountValue' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

export interface VoucherDetailQuery {
  id?: string;
}

export const createVoucher = async (data: VoucherFormValues): Promise<VoucherResponse> => {
  const res = await api.post('/v1/vouchers/admin/create', data);
  return res.data;
};

export const updateVoucher = async (
  id: string,
  data: VoucherFormValues
): Promise<VoucherResponse> => {
  const payload = {
    title: data.title,
    description: data.description,
    isVisible: data.isVisible,
    isActive: data.isActive,
    expiresAt: data.expiresAt,
  };
  const res = await api.put(`/v1/vouchers/admin/update/${id}`, payload);
  return res.data;
};

export const deleteVouchers = async (ids: string[], soft = false): Promise<void> => {
  await api.delete('/v1/vouchers/admin/delete', { data: { ids }, params: { soft } });
};

export const getVouchers = async (
  params: GetVouchersQueryParams
): Promise<PaginatedResponse<VoucherResponse>> => {
  const { data } = await api.get('/v1/vouchers', { params });
  return data;
};

export async function getVouchersDetail(query: VoucherDetailQuery) {
  const { data } = await api.get<VoucherResponse>('/v1/vouchers/detail', {
    params: query,
  });
  return data;
}
