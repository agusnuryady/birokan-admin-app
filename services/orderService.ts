// src/services/orderService.ts

import api from '@/lib/axios';
import { CostOptionInput } from './procedureService';

/* ---------------------------------------------
 * Order Types (Adjust based on your backend model)
 * --------------------------------------------- */

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'COMPLETED';

export interface OrderResponse {
  id: string;
  userId: string;
  procedureId: string;
  voucherId?: string | null;
  xenditId?: string | null;
  invoiceUrl?: string | null;

  totalAmount: number;
  amountBreakdown?: Record<string, any> | null;

  currentStep?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;

  date: string; // DateTime
  notes?: string | null;

  status: OrderStatus;

  rating?: number | null; // 1-5
  reviewNotes?: string | null;

  verificationCodeId?: string | null;

  createdAt: string;
  updatedAt: string;

  /* ---------------- Relations ---------------- */

  user?: {
    id: string;
    fullName?: string | null;
    email: string;
    phoneNumber?: string | null;
    profilePicUrl?: string | null;
    address?: string | null;
  } | null;

  procedure?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    isActive: boolean;
    isAssistant: boolean;
    costOptions: CostOptionInput[];
  } | null;

  agents?: {
    id: string;
    userId: string;
    isActive: boolean;
    rating?: number | null;
  }[];

  orderAnswers?: {
    id: string;
    questionId: string;
    answer: any;
  }[];

  orderDeclarations?: {
    id: string;
    declarationId: string;
    accepted: boolean;
  }[];

  orderDocuments?: {
    id: string;
    fileId: string;
    type: string;
    url: string;
  }[];

  completionRecord?: {
    id: string;
    completedAt: string;
  }[];

  verificationCode?: {
    id: string;
    code: string;
    expiresAt: string;
  } | null;

  review?: {
    id: string;
    rating: number;
    notes?: string | null;
  } | null;

  agentReviews?: {
    id: string;
    agentId: string;
    rating: number;
    notes?: string | null;
  }[];

  vouchers?: {
    id: string;
    voucherId: string;
  }[];
}

export interface OrderListItem {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  date: string;
  createdAt: string;
  updatedAt: string;

  user: {
    fullName?: string | null;
  } | null;

  procedure: {
    name: string;
  } | null;
}

/* Pagination Types (same as vouchers) */
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

/* ------------------------------------------------
 * Query Params for GET /admin
 * (Based on GetOrdersForAdminDto)
 * ------------------------------------------------ */
export interface GetOrdersQueryParams {
  status?: OrderStatus;
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
  createdFrom?: string; // ISO string
  createdTo?: string; // ISO string
  updatedFrom?: string; // ISO string
  updatedTo?: string; // ISO string
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/* ------------------------------------------------
 * 1️⃣ Get Orders (Admin)
 * ------------------------------------------------ */
export const getOrders = async (
  params: GetOrdersQueryParams
): Promise<PaginatedResponse<OrderListItem>> => {
  const { data } = await api.get('/v1/orders/admin', {
    params,
  });

  return data;
};

/* ------------------------------------------------
 * 2️⃣ Get Order Detail (Admin)
 * GET /v1/orders/admin/detail?orderId=xxx
 * ------------------------------------------------ */
export interface OrderDetailQuery {
  orderId: string;
}

export const getOrderDetail = async (query: OrderDetailQuery): Promise<OrderResponse> => {
  const { data } = await api.get('/v1/orders/admin/detail', {
    params: query,
  });

  return data;
};

export const getPayments = async () => {
  const { data } = await api.get('/v1/payments/admin');

  return data;
};
