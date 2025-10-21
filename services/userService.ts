import api from '@/lib/axios';

export interface UserFormValues {
  role?: string;
  isActive?: boolean;
  isAgent?: boolean;
}

export interface UserResponse {
  id: string;
  profilePicId?: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  idCardNumber?: string;
  role: string;
  isActive: boolean;
  isAgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isAgent?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface UserDetailQuery {
  id?: string;
}

// Get User Me by Token
export const getMe = async () => {
  const { data } = await api.get<UserResponse>('/v1/users/me');

  return data;
};

export async function updateUserAdmin(id: string, payload: UserFormValues) {
  const { data } = await api.put<UserResponse>(`/v1/users/admin/update/${id}`, payload);

  return data;
}

export async function getUsers(query: UserQuery) {
  const { data } = await api.get<PaginatedResponse<UserResponse>>('/v1/users', {
    params: query,
  });
  return data;
}

export async function getUserDetail(query: UserDetailQuery) {
  const { data } = await api.get<UserResponse>('/v1/users/detail', {
    params: query,
  });
  return data;
}
