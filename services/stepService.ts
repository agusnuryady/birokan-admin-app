import api from '@/lib/axios';

export interface StepFormValues {
  description: string;
  image?: File | null;
}

export interface StepResponse {
  id: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StepQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
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

export interface StepDetailQuery {
  id: string;
}

export async function createStep(values: StepFormValues) {
  const formData = new FormData();
  formData.append('description', values.description);

  if (values.image) {
    formData.append('image', values.image);
  }

  const { data } = await api.post<StepResponse>('/v1/steps/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function updateStep(id: string, values: StepFormValues) {
  const formData = new FormData();

  formData.append('description', values.description);

  if (values.image) {
    formData.append('image', values.image);
  }

  const { data } = await api.put<StepResponse>(`/v1/steps/admin/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function getSteps(query: StepQuery) {
  const { data } = await api.get<PaginatedResponse<StepResponse>>('/v1/steps', {
    params: query,
  });
  return data;
}

export async function deleteStep(ids: string[]) {
  const { data } = await api.delete('/v1/steps/admin/delete', {
    data: { ids }, // request body
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

export async function getStepDetail(query: StepDetailQuery) {
  const { data } = await api.get<StepResponse>('/v1/steps/detail', {
    params: query,
  });
  return data;
}
