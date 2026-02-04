import api from '@/lib/axios';

export interface DirectoryFormValues {
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  image?: File | null;
}

export interface DirectoryResponse {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  imageUrl?: string;
  procedureCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryQuery {
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

export interface DirectoryDetailQuery {
  id?: string;
  slug?: string;
}

export async function createDirectory(values: DirectoryFormValues) {
  const formData = new FormData();

  formData.append('slug', values.slug);
  formData.append('name', values.name);
  formData.append('isActive', String(values.isActive));

  if (values.description) {
    formData.append('description', values.description);
  }
  if (values.image) {
    formData.append('image', values.image);
  }

  const { data } = await api.post<DirectoryResponse>('/v1/directories/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function updateDirectory(id: string, values: DirectoryFormValues) {
  const formData = new FormData();

  formData.append('slug', values.slug);
  formData.append('name', values.name);
  formData.append('isActive', String(values.isActive));

  if (values.description) {
    formData.append('description', values.description);
  }
  if (values.image) {
    formData.append('image', values.image);
  }

  const { data } = await api.put<DirectoryResponse>(
    `/v1/directories/admin/update/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}

export async function getDirectories(query: DirectoryQuery) {
  const { data } = await api.get<PaginatedResponse<DirectoryResponse>>('/v1/directories/admin', {
    params: query,
  });
  return data;
}

export async function deleteDirectories(ids: string[], soft = false) {
  const { data } = await api.delete('/v1/directories/admin/delete', {
    data: { ids }, // request body
    params: { soft }, // query string
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

export async function getDirectoryDetail(query: DirectoryDetailQuery) {
  const { data } = await api.get<DirectoryResponse>('/v1/directories/admin/detail', {
    params: query,
  });
  return data;
}
