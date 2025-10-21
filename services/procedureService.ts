import api from '@/lib/axios';
import { DirectoryResponse } from './directoryService';

/* ----------------------- Types matching backend DTO ----------------------- */
interface DocumentItem {
  id: string;
  name: string;
  type: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureDocumentInput {
  id?: string;
  documentId: string;
  amount?: number;
  required?: boolean;
  document?: DocumentItem;
}

interface PlaceItem {
  id: string;
  name: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedurePlaceInput {
  id?: string;
  placeId: string;
  place?: PlaceItem;
}

export interface ProcedureStepInput {
  id?: string;
  description: string;
  order: number;
  group: string;
  image?: File | null;
  imageUrl?: string;
  linkURL?: string;
}

/* ----------------------- Form Values for Frontend ------------------------ */
export interface ProcedureFormValues {
  id?: string;
  directoryId: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  isAssistant?: boolean;
  duration?: number;
  cost?: number;
  documents: ProcedureDocumentInput[];
  places: ProcedurePlaceInput[];
  steps: ProcedureStepInput[];
}

/* ----------------------- Response Models ----------------------- */
export interface ProcedureResponse {
  id: string;
  slug: string;
  name: string;
  directory: DirectoryResponse;
  description?: string;
  isActive: boolean;
  isAssistant?: boolean;
  duration?: number;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  directoryId: string;
  documents?: ProcedureDocumentInput[];
  places?: ProcedurePlaceInput[];
  steps?: ProcedureStepInput[];
}

/* ----------------------- Query & Pagination ----------------------- */
export interface ProcedureQuery {
  directoryId?: string;
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isAssistant?: boolean;
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

export interface ProcedureDetailQuery {
  id?: string;
  slug?: string;
}

export interface ProcedureDropdownResponse {
  directory: {
    id: string;
    name: string;
  }[];
  documents: {
    id: string;
    name: string;
  }[];
  places: {
    id: string;
    name: string;
  }[];
  stepGroup: {
    id: string;
    group: string;
  }[];
}

/* ----------------------- CRUD API ----------------------- */

// ✅ CREATE procedure
export async function createProcedure(values: ProcedureFormValues) {
  const formData = new FormData();

  // ✅ Append all text fields
  formData.append('directoryId', values.directoryId);
  formData.append('name', values.name);
  formData.append('slug', values.slug);
  if (values.description) {
    formData.append('description', values.description);
  }
  if (values.isActive !== undefined) {
    formData.append('isActive', String(values.isActive));
  }
  if (values.isAssistant !== undefined) {
    formData.append('isAssistant', String(values.isAssistant));
  }
  if (values.duration !== undefined) {
    formData.append('duration', String(values.duration));
  }
  if (values.cost !== undefined) {
    formData.append('cost', String(values.cost));
  }

  // --- Array fields ---
  (values.documents ?? []).forEach((doc, i) => {
    if (doc.documentId) {
      formData.append(`documents[${i}][documentId]`, doc.documentId);
    }
    if (doc.amount !== undefined) {
      formData.append(`documents[${i}][amount]`, String(doc.amount));
    }
    if (doc.required !== undefined) {
      formData.append(`documents[${i}][required]`, String(doc.required));
    }
  });

  (values.places ?? []).forEach((place, i) => {
    if (place.placeId) {
      formData.append(`places[${i}][placeId]`, place.placeId);
    }
  });

  (values.steps ?? []).forEach((step, i) => {
    if (step.id) {
      formData.append(`steps[${i}][id]`, step.id);
    }
    if (step.description) {
      formData.append(`steps[${i}][description]`, step.description);
    }
    if (step.order !== undefined) {
      formData.append(`steps[${i}][order]`, String(step.order));
    }
    if (step.group) {
      formData.append(`steps[${i}][group]`, step.group);
    }
    if (step.linkURL) {
      formData.append(`steps[${i}][linkURL]`, step.linkURL);
    }

    // image file (optional)
    if (step.image instanceof File) {
      formData.append(`images`, step.image); // backend can map this separately
    }
  });

  // // ✅ Append all step images
  // values.steps.forEach((step) => {
  //   if (step.image instanceof File) {
  //     formData.append('images', step.image);
  //   }
  // });

  // ✅ Send multipart/form-data
  const { data } = await api.post<ProcedureResponse>('/v1/procedures/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

// ✅ UPDATE procedure
export async function updateProcedure(id: string, values: ProcedureFormValues) {
  const formData = new FormData();

  // ✅ Append all text fields
  formData.append('directoryId', values.directoryId);
  formData.append('name', values.name);
  formData.append('slug', values.slug);

  if (values.description) {
    formData.append('description', values.description);
  }
  if (values.isActive !== undefined) {
    formData.append('isActive', String(values.isActive));
  }
  if (values.isAssistant !== undefined) {
    formData.append('isAssistant', String(values.isAssistant));
  }
  if (values.duration !== undefined) {
    formData.append('duration', String(values.duration));
  }
  if (values.cost !== undefined) {
    formData.append('cost', String(values.cost));
  }

  /** ---------------------- DOCUMENTS ---------------------- **/
  (values.documents ?? []).forEach((doc, i) => {
    if (doc.documentId) {
      formData.append(`documents[${i}][documentId]`, doc.documentId);
    }
    if (doc.amount !== undefined) {
      formData.append(`documents[${i}][amount]`, String(doc.amount));
    }
    if (doc.required !== undefined) {
      formData.append(`documents[${i}][required]`, String(doc.required));
    }
  });

  /** ---------------------- PLACES ---------------------- **/
  (values.places ?? []).forEach((place, i) => {
    if (place.placeId) {
      formData.append(`places[${i}][placeId]`, place.placeId);
    }
  });

  /** ---------------------- STEPS ---------------------- **/
  let imageFileIndex = 0;

  (values.steps ?? []).forEach((step, i) => {
    if (step.id) {
      formData.append(`steps[${i}][id]`, step.id);
    }
    if (step.description) {
      formData.append(`steps[${i}][description]`, step.description);
    }
    if (step.order !== undefined) {
      formData.append(`steps[${i}][order]`, String(step.order));
    }
    if (step.group) {
      formData.append(`steps[${i}][group]`, step.group);
    }
    if (step.linkURL) {
      formData.append(`steps[${i}][linkURL]`, step.linkURL);
    }

    // ✅ Handle image properly
    if (step.image instanceof File) {
      // Append file to FormData
      formData.append('images', step.image);

      // ✅ Mark which file index belongs to this step
      formData.append(`steps[${i}][fileIndex]`, String(imageFileIndex));

      // increment counter for next image
      imageFileIndex++;
    } else if (typeof step.imageUrl === 'string' && step.imageUrl.length > 0) {
      // Preserve existing Supabase image URL, stripping token and /object/... prefix
      try {
        const url = new URL(step.imageUrl);
        const pathname = url.pathname;

        // Match after '/object/sign/steps/' or '/object/public/steps/'
        const match = pathname.match(/\/object\/(?:sign|public)\/steps\/(.+)$/);
        const filename = match ? decodeURIComponent(match[1]) : step.imageUrl;

        // ✅ Strip out the "steps/" folder prefix if accidentally included
        const cleanFilename = filename.replace(/^steps\//, '');

        // ✅ Append only the filename (e.g. '1760631676772-xxxx.png')
        formData.append(`steps[${i}][imageUrl]`, cleanFilename);
      } catch {
        // Fallback if it's not a valid URL
        const cleanFilename = step.imageUrl.replace(/^steps\//, '');
        formData.append(`steps[${i}][imageUrl]`, cleanFilename);
      }
    } else {
      // No image at all
      formData.append(`steps[${i}][imageUrl]`, '');
    }
  });

  // ✅ Send multipart/form-data
  const { data } = await api.put<ProcedureResponse>(`/v1/procedures/admin/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

// ✅ GET procedures list (with pagination & filters)
export async function getProcedures(query: ProcedureQuery) {
  const { data } = await api.get<PaginatedResponse<ProcedureResponse>>('/v1/procedures', {
    params: query,
  });
  return data;
}

// ✅ DELETE procedures
export async function deleteProcedures(ids: string[], soft = false) {
  const { data } = await api.delete('/v1/procedures/admin/delete', {
    data: { ids },
    params: { soft },
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

// ✅ GET procedure detail (by id or slug)
export async function getProcedureDetail(query: ProcedureDetailQuery) {
  const { data } = await api.get<ProcedureResponse>('/v1/procedures/detail', { params: query });
  return data;
}

// ✅ GET procedure dropdown data
export async function getProcedureDropdown() {
  const { data } = await api.get<ProcedureDropdownResponse>('/v1/procedures/dropdown');
  return data;
}
