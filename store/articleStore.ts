import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import { ArticleQuery, ArticleResponse, getArticle } from '@/services/articleService';
import { PaginatedResponse } from '@/services/directoryService';

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
      let errorMessage = 'Something went wrong';
      // console.log('error', error);
      if (error.response) {
        // Backend responded with error status
        if (error.response.data?.message) {
          errorMessage = error.response.data?.message;
        }
      }
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      set({ loading: false });
    }
  },
}));
