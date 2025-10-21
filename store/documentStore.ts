import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import {
  DocumentResponse,
  getDocuments,
  GetDocumentsParams,
  PaginatedResponse,
} from '@/services/documentService';

interface DocumenState {
  documents: DocumentResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: GetDocumentsParams;
  searchDocuments: string;
  optionsDefaultValue: string[] | [];
  setSearchDocuments: (value: string) => void;
  fetchDocuments: (query?: Partial<GetDocumentsParams>) => Promise<void>;
}

export const useDocumenStore = create<DocumenState>((set, get) => ({
  documents: [],
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
  searchDocuments: '',
  optionsDefaultValue: [],
  setSearchDocuments: (value) => {
    set({ searchDocuments: value });
  },
  fetchDocuments: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<DocumentResponse> = await getDocuments(merged);
      const defaultOptions: string[] = await res.data.map((item) => item.type);

      set((val) => {
        return {
          documents: res.data,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages,
          page: res.pagination.page,
          limit: res.pagination.limit,
          query: merged,
          optionsDefaultValue: Array.from(new Set([...val.optionsDefaultValue, ...defaultOptions])),
        };
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
