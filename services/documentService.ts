import api from '@/lib/axios';

export interface DocumentResponse {
  id: string;
  name: string;
  type: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateDocumentDto {
  name: string;
  slug?: string;
  type?: string;
  desc?: string;
  directoryId?: string;
  isActive?: boolean;
}

export interface UpdateDocumentDto extends CreateDocumentDto {}

export interface DeleteDocumentsDto {
  ids: string[];
  soft?: boolean;
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

/**
 * Get paginated list of documents (admin)
 */
export async function getDocuments(params: GetDocumentsParams) {
  const response = await api.get<PaginatedResponse<DocumentResponse>>(`/v1/documents`, {
    params,
  });
  return response.data;
}

/**
 * Get document detail by ID or slug (admin)
 */
export async function getDocumentDetail(id?: string, slug?: string) {
  const response = await api.get<{ data: DocumentResponse }>(`/v1/documents/detail`, {
    params: { id, slug },
  });
  return response.data;
}

/**
 * Create a new document (admin)
 */
export async function createDocument(payload: CreateDocumentDto) {
  const response = await api.post<DocumentResponse>(`/v1/documents/admin/create`, payload);
  return response.data;
}

/**
 * Update a document by ID (admin)
 */
export async function updateDocument(id: string, payload: UpdateDocumentDto) {
  const response = await api.put<DocumentResponse>(`/v1/documents/admin/update/${id}`, payload);
  return response.data;
}

/**
 * Delete multiple documents (admin)
 */
export async function deleteDocuments(ids: string[]) {
  const response = await api.delete(`/v1/documents/admin/delete`, {
    data: { ids },
  });
  return response.data;
}
