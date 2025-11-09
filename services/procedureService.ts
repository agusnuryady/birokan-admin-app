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

export interface ProcedureRequirementInput {
  id?: string;
  description: string;
}

export interface ProcedureDocumentInput {
  id?: string;
  documentId: string;
  amount?: number;
  required?: boolean;
  directoryId?: string;
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

export enum QuestionType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  FILE = 'FILE',
}
export interface ProcedureQuestionInput {
  id?: string;
  label?: string;
  description?: string;
  questionText: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

export interface ProcedureDeclarationInput {
  id?: string;
  title: string;
  boldText?: string;
  content?: string;
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
  requirements: ProcedureRequirementInput[];
  documents: ProcedureDocumentInput[];
  places: ProcedurePlaceInput[];
  steps: ProcedureStepInput[];
  questions: ProcedureQuestionInput[];
  declarations: ProcedureDeclarationInput[];
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
  requirements?: ProcedureRequirementInput[];
  questions: ProcedureQuestionInput[];
  declarations: ProcedureDeclarationInput[];
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
  (values.requirements ?? []).forEach((requirement, i) => {
    if (requirement.description) {
      formData.append(`requirements[${i}][description]`, requirement.description);
    }
  });

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
    if (doc.directoryId !== undefined && doc.directoryId !== null) {
      formData.append(`documents[${i}][directoryId]`, String(doc.directoryId));
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
    formData.append(`steps[${i}][group]`, step.group ?? '');
    formData.append(`steps[${i}][linkURL]`, step.linkURL ?? '');

    // image file (optional)
    if (step.image instanceof File) {
      formData.append(`images`, step.image); // backend can map this separately
    }
  });

  /** ---------------------- QUESTIONS ---------------------- **/
  (values.questions ?? []).forEach((question, i) => {
    if (question.label !== undefined) {
      formData.append(`questions[${i}][label]`, String(question.label));
    }
    if (question.description !== undefined) {
      formData.append(`questions[${i}][description]`, String(question.description));
    }
    if (question.questionText !== undefined) {
      formData.append(`questions[${i}][questionText]`, String(question.questionText));
    }
    if (question.type !== undefined) {
      formData.append(`questions[${i}][type]`, String(question.type));
    }
    if (question.required !== undefined) {
      formData.append(`questions[${i}][required]`, String(question.required));
    }
    if (question.options !== undefined) {
      formData.append(`questions[${i}][options]`, JSON.stringify(question.options));
    }
  });

  /** ---------------------- DECLARATIONS ---------------------- **/
  (values.declarations ?? []).forEach((declaration, i) => {
    if (declaration.title !== undefined) {
      formData.append(`declarations[${i}][title]`, String(declaration.title));
    }
    if (declaration.boldText !== undefined) {
      formData.append(`declarations[${i}][boldText]`, String(declaration.boldText));
    }
    if (declaration.content !== undefined) {
      formData.append(`declarations[${i}][content]`, String(declaration.content));
    }
  });

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

  formData.append('description', values.description ?? '');
  if (values.isActive !== undefined) {
    formData.append('isActive', String(values.isActive));
  }
  if (values.isAssistant !== undefined) {
    formData.append('isAssistant', String(values.isAssistant));
  }
  if (values.duration) {
    formData.append('duration', String(values.duration));
  }
  if (values.cost) {
    formData.append('cost', String(values.cost));
  }

  /** ---------------------- REQUIREMENTS ---------------------- **/
  (values.requirements ?? []).forEach((requirement, i) => {
    if (requirement.description) {
      formData.append(`requirements[${i}][description]`, requirement.description);
    }
  });

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
    formData.append(`documents[${i}][directoryId]`, String(doc.directoryId ?? ''));
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
    formData.append(`steps[${i}][group]`, step.group ?? '');
    formData.append(`steps[${i}][linkURL]`, step.linkURL ?? '');

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

  /** ---------------------- QUESTIONS ---------------------- **/
  (values.questions ?? []).forEach((question, i) => {
    if (question.label !== undefined) {
      formData.append(`questions[${i}][label]`, String(question.label));
    }
    formData.append(`questions[${i}][description]`, String(question.description ?? ''));
    if (question.questionText !== undefined) {
      formData.append(`questions[${i}][questionText]`, String(question.questionText));
    }
    if (question.type !== undefined) {
      formData.append(`questions[${i}][type]`, String(question.type));
    }
    if (question.required !== undefined) {
      formData.append(`questions[${i}][required]`, String(question.required));
    }
    if (question.options !== undefined) {
      formData.append(`questions[${i}][options]`, JSON.stringify(question.options));
    }
  });

  /** ---------------------- DECLARATIONS ---------------------- **/
  (values.declarations ?? []).forEach((declaration, i) => {
    if (declaration.title !== undefined) {
      formData.append(`declarations[${i}][title]`, String(declaration.title));
    }
    formData.append(`declarations[${i}][boldText]`, String(declaration.boldText ?? ''));
    formData.append(`declarations[${i}][content]`, String(declaration.content ?? ''));
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
