import api from '@/lib/axios';

export interface PlaceResponse {
  id: string;
  name: string;
  desc?: string;
  locationCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaceFormValues {
  name: string;
  desc?: string;
}

export interface UpdatePlaceDto {
  name: string;
  desc?: string;
}

export interface GetPlaceParams {
  page?: number;
  limit?: number;
  search?: string;
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

export const createPlace = async (data: PlaceFormValues): Promise<PlaceResponse> => {
  const res = await api.post('/v1/places/admin/create', data);
  return res.data;
};

export const updatePlace = async (id: string, data: UpdatePlaceDto): Promise<PlaceResponse> => {
  const res = await api.patch(`/v1/places/admin/update/${id}`, data);
  return res.data;
};

export const deletePlaces = async (ids: string[]): Promise<void> => {
  await api.delete('/v1/places/admin/delete', { data: { ids } });
};

export const getPlaces = async (params: GetPlaceParams) => {
  const res = await api.get('/v1/places', { params });
  return res.data;
};
