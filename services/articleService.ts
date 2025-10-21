import api from '@/lib/axios';

export interface ArticleFormValues {
  slug: string;
  title: string;
  content: string;
  articleDate: string;
  writer: string;
  image?: File | null;
  imageDesc?: string;
  sourceURL?: string;
  isActive: boolean;
}

export interface ArticleResponse {
  id: string;
  slug: string;
  title: string;
  content: string;
  articleDate: string;
  writer: string;
  imageUrl?: string;
  imageDesc: string;
  sourceURL: string;
  isActive: boolean;
  procedureCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleQuery {
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

export interface ArticleDetailQuery {
  id?: string;
  slug?: string;
}

export async function createArticle(values: ArticleFormValues) {
  const formData = new FormData();

  formData.append('slug', values.slug);
  formData.append('title', values.title);
  formData.append('content', values.content);
  formData.append('articleDate', values.articleDate);
  formData.append('writer', values.writer);
  formData.append('isActive', String(values.isActive));

  if (values.imageDesc) {
    formData.append('imageDesc', values.imageDesc);
  }
  if (values.sourceURL) {
    formData.append('sourceURL', values.sourceURL);
  }
  if (values.image) {
    formData.append('image', values.image);
  }

  const { data } = await api.post<ArticleResponse>('/v1/articles/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function updateArticle(id: string, values: ArticleFormValues) {
  const formData = new FormData();

  formData.append('slug', values.slug);
  formData.append('title', values.title);
  formData.append('content', values.content);
  formData.append('articleDate', values.articleDate);
  formData.append('writer', values.writer);
  formData.append('isActive', String(values.isActive));

  if (values.imageDesc) {
    formData.append('imageDesc', values.imageDesc);
  }
  if (values.sourceURL) {
    formData.append('sourceURL', values.sourceURL);
  }
  if (values.image) {
    formData.append('image', values.image);
  }

  const { data } = await api.put<ArticleResponse>(`/v1/articles/admin/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function getArticle(query: ArticleQuery) {
  const { data } = await api.get<PaginatedResponse<ArticleResponse>>('/v1/articles', {
    params: query,
  });
  return data;
}

export async function deleteArticles(ids: string[], soft = false) {
  const { data } = await api.delete('/v1/articles/admin/delete', {
    data: { ids }, // request body
    params: { soft }, // query string
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

export async function getArticleDetail(query: ArticleDetailQuery) {
  const { data } = await api.get<ArticleResponse>('/v1/articles/detail', {
    params: query,
  });
  return data;
}
