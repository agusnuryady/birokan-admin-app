import api from '@/lib/axios';

export interface AreaOperation {
  lat: number;
  long: number;
}

export interface AgentData {
  profilePicture?: File | string; // can be existing URL or uploaded file
  idProofUrls?: (File | string)[]; // same — can mix files and URLs
  idFullName?: string;
  residentialAddress?: string;
  relativePhoneNumber?: string;
  areaOperations?: AreaOperation[];
  isActive?: boolean;
  keepIdProofUrls?: string[];
  removeIdProofUrls?: string[];
}

export interface UserFormValues {
  id?: string;
  profilePicId?: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  idCardNumber?: string;
  role?: string;
  isActive?: boolean;
  isAgent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  agent?: AgentData;
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
  agent?: AgentData;
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
  const formData = new FormData();

  // 🧩 Base fields
  if (payload.role !== undefined) {
    formData.append('role', payload.role);
  }
  if (payload.isActive !== undefined) {
    formData.append('isActive', String(payload.isActive));
  }
  if (payload.isAgent !== undefined) {
    formData.append('isAgent', String(payload.isAgent));
  }

  // 🧩 If user is agent, prepare JSON and files
  if (payload.isAgent && payload.agent) {
    const { profilePicture, idProofUrls, keepIdProofUrls, removeIdProofUrls, ...rest } =
      payload.agent;

    // ✅ Handle profile picture (only send if File)
    if (profilePicture instanceof File) {
      formData.append('profilePicture', profilePicture);
    }

    // ✅ Handle new ID proof files (if any)
    const newIdProofFiles = (idProofUrls || []).filter((item) => item instanceof File) as File[];
    const existingIdProofUrls = (idProofUrls || []).filter(
      (item) => typeof item === 'string'
    ) as string[];

    if (newIdProofFiles?.length) {
      newIdProofFiles.forEach((file) => {
        formData.append('idProofFiles', file);
      });
    }

    // keep existing URLs
    if (Array.isArray(existingIdProofUrls)) {
      existingIdProofUrls.forEach((url, idx) => {
        formData.append(`agentData[keepIdProofUrls][${idx}]`, url);
      });
    }

    // remove URLs (optional)
    if (Array.isArray(removeIdProofUrls)) {
      removeIdProofUrls.forEach((url, idx) => {
        formData.append(`agentData[removeIdProofUrls][${idx}]`, url);
      });
    }

    formData.append(`agentData[idFullName]`, String(rest.idFullName));
    formData.append(`agentData[residentialAddress]`, String(rest.residentialAddress));
    formData.append(`agentData[relativePhoneNumber]`, String(rest.relativePhoneNumber));
    if (Array.isArray(rest.areaOperations)) {
      rest.areaOperations.forEach((op, idx) => {
        formData.append(`agentData[areaOperations][${idx}][lat]`, String(op.lat));
        formData.append(`agentData[areaOperations][${idx}][long]`, String(op.long));
      });
    }
    formData.append(`agentData[isActive]`, String(rest.isActive));
  }

  // ✅ PUT request with multipart/form-data
  const { data } = await api.put<UserResponse>(`/v1/users/admin/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

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
