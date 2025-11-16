import { create } from 'zustand';
import { ArticleQuery, ArticleResponse, getArticle } from '@/services/articleService';
import { PaginatedResponse } from '@/services/directoryService';
import { notifyApiError } from '@/utils/handleApiError';

interface ArticleState {
  articles: ArticleResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: ArticleQuery;
  searchArticles: string;
  setSearchArticles: (value: string) => void;
  fetchArticles: (query?: Partial<ArticleQuery>) => Promise<void>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
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
  searchArticles: '',
  setSearchArticles: (value) => {
    set({ searchArticles: value });
  },
  fetchArticles: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<ArticleResponse> = await getArticle(merged);

      set({
        articles: res.data,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        page: res.pagination.page,
        limit: res.pagination.limit,
        query: merged,
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      set({ loading: false });
    }
  },
}));
