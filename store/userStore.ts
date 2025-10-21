import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import { getUsers, PaginatedResponse, UserQuery, UserResponse } from '@/services/userService';

interface UserState {
  users: UserResponse[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  query: UserQuery;
  searchUsers: string;
  setSearchUsers: (value: string) => void;
  fetchUsers: (query?: Partial<UserQuery>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
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
  searchUsers: '',
  setSearchUsers: (value) => {
    set({ searchUsers: value });
  },
  fetchUsers: async (query) => {
    set({ loading: true });
    try {
      const merged = { ...get().query, ...query };
      const res: PaginatedResponse<UserResponse> = await getUsers(merged);

      set({
        users: res.data,
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
