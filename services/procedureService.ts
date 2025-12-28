import { CostFormulaToken } from '@/app/(app)/procedure/_components/custom-cost/types';
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
  directorySlug?: string;
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

export interface CostOptionInput {
  cost: number;
  title: string;
  desc: string;
  minTime: number;
  maxTime: number;
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
  image?: File | null;
  imageUrl?: string;
  linkURL?: string;
}

export interface ProcedureDeclarationInput {
  id?: string;
  title: string;
  boldText?: string;
  content?: string;
}

export interface CompleteOrderDeclarationInput {
  id?: string;
  title: string;
  boldText?: string;
  content?: string;
}

// type CostFormulaToken =
//   | {
//       id: string;
//       type: 'VARIABLE';
//       source: 'QUESTION' | 'FIXED';
//       questionId?: string;
//       title?: string;
//       fixedValue?: number;
//       fixedString?: string;
//       sampleValue?: number | string;
//       role?: 'MONEY' | 'LOGIC';
//     }
//   | {
//       id: string;
//       type: 'SYMBOL';
//       symbol:
//         | '+'
//         | '-'
//         | '*'
//         | '/'
//         | '('
//         | ')'
//         | '>'
//         | '<'
//         | '>='
//         | '<='
//         | '=='
//         | 'IF'
//         | ','
//         | 'TODAY'
//         | 'DATEDIFF_MONTHS';
//     };

/* ----------------------- Form Values for Frontend ------------------------ */
export interface ProcedureFormValues {
  id?: string;
  directoryId: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  isAssistant?: boolean;
  costOptions: CostOptionInput[];
  requirements: ProcedureRequirementInput[];
  documents: ProcedureDocumentInput[];
  places: ProcedurePlaceInput[];
  steps: ProcedureStepInput[];
  questions: ProcedureQuestionInput[];
  declarations: ProcedureDeclarationInput[];
  completeForms: CompleteOrderDeclarationInput[];
  costFormula?: {
    tokens: CostFormulaToken[];
  };
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
  costOptions?: CostOptionInput[];
  createdAt: string;
  updatedAt: string;
  directoryId: string;
  documents?: ProcedureDocumentInput[];
  places?: ProcedurePlaceInput[];
  steps?: ProcedureStepInput[];
  requirements?: ProcedureRequirementInput[];
  questions: ProcedureQuestionInput[];
  declarations: ProcedureDeclarationInput[];
  completeForms: CompleteOrderDeclarationInput[];
  costFormula?: {
    tokens: CostFormulaToken[];
  };
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
    slug: string;
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

  /* ================= BASIC FIELDS ================= */
  formData.append('directoryId', values.directoryId);
  formData.append('name', values.name);
  formData.append('slug', values.slug);

  if (values.description) {
    formData.append('description', values.description);
  }

  formData.append('isActive', String(values.isActive));
  formData.append('isAssistant', String(values.isAssistant));

  /* ================= COST OPTIONS ================= */
  (values.costOptions ?? []).forEach((op, i) => {
    formData.append(`costOptions[${i}][cost]`, String(op.cost));
    formData.append(`costOptions[${i}][title]`, op.title);
    formData.append(`costOptions[${i}][desc]`, op.desc);
    formData.append(`costOptions[${i}][minTime]`, String(op.minTime));
    formData.append(`costOptions[${i}][maxTime]`, String(op.maxTime));
  });

  /* ================= COST FORMULA ================= */
  if (values.costFormula && values.costFormula.tokens.length > 0) {
    formData.append('costFormula', JSON.stringify(values.costFormula));
  }

  /* ================= REQUIREMENTS ================= */
  (values.requirements ?? []).forEach((r, i) => {
    if (r.description) {
      formData.append(`requirements[${i}][description]`, r.description);
    }
  });

  /* ================= DOCUMENTS ================= */
  (values.documents ?? []).forEach((d, i) => {
    if (d.documentId) {
      formData.append(`documents[${i}][documentId]`, d.documentId);
    }
    formData.append(`documents[${i}][amount]`, String(d.amount));
    formData.append(`documents[${i}][required]`, String(d.required));
    if (d.directoryId) {
      formData.append(`documents[${i}][directoryId]`, d.directoryId);
    }
    if (d.directorySlug) {
      formData.append(`documents[${i}][directorySlug]`, d.directorySlug);
    }
  });

  /* ================= PLACES ================= */
  (values.places ?? []).forEach((p, i) => {
    if (p.placeId) {
      formData.append(`places[${i}][placeId]`, p.placeId);
    }
  });

  /* ================= STEPS ================= */
  (values.steps ?? []).forEach((s, i) => {
    formData.append(`steps[${i}][id]`, s.id ?? '');
    formData.append(`steps[${i}][description]`, s.description ?? '');
    formData.append(`steps[${i}][order]`, String(s.order ?? i + 1));
    formData.append(`steps[${i}][group]`, s.group ?? '');
    formData.append(`steps[${i}][linkURL]`, s.linkURL ?? '');

    if (s.image instanceof File) {
      formData.append('stepImages', s.image);
    }
  });

  /* ================= QUESTIONS ================= */
  (values.questions ?? []).forEach((q, i) => {
    if (q.id) {
      formData.append(`questions[${i}][id]`, q.id);
    }

    formData.append(`questions[${i}][questionText]`, q.questionText);
    formData.append(`questions[${i}][type]`, q.type);
    formData.append(`questions[${i}][required]`, String(q.required));
    formData.append(`questions[${i}][description]`, q.description ?? '');
    formData.append(`questions[${i}][options]`, JSON.stringify(q.options ?? []));
    formData.append(`questions[${i}][linkURL]`, q.linkURL ?? '');

    if (q.image instanceof File) {
      formData.append('questionImages', q.image);
    }
  });

  /* ================= DECLARATIONS ================= */
  (values.declarations ?? []).forEach((d, i) => {
    formData.append(`declarations[${i}][title]`, d.title);
    if (d.boldText !== undefined) {
      formData.append(`declarations[${i}][boldText]`, d.boldText);
    }
    if (d.content !== undefined) {
      formData.append(`declarations[${i}][content]`, d.content);
    }
  });

  /* ================= COMPLETE FORMS ================= */
  (values.completeForms ?? []).forEach((c, i) => {
    formData.append(`completeForms[${i}][title]`, c.title);
    if (c.boldText !== undefined) {
      formData.append(`completeForms[${i}][boldText]`, c.boldText);
    }
    if (c.content !== undefined) {
      formData.append(`completeForms[${i}][content]`, c.content);
    }
  });

  const { data } = await api.post<ProcedureResponse>('/v1/procedures/admin/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
  /* ================= COST OPTIONS ================= */
  (values.costOptions ?? []).forEach((op, i) => {
    formData.append(`costOptions[${i}][cost]`, String(op.cost));
    formData.append(`costOptions[${i}][title]`, op.title);
    formData.append(`costOptions[${i}][desc]`, op.desc);
    formData.append(`costOptions[${i}][minTime]`, String(op.minTime));
    formData.append(`costOptions[${i}][maxTime]`, String(op.maxTime));
  });

  /* ================= COST FORMULA ================= */
  if (values.costFormula && values.costFormula.tokens.length > 0) {
    formData.append('costFormula', JSON.stringify(values.costFormula));
  }

  /** ---------------------- REQUIREMENTS ---------------------- **/
  (values.requirements ?? []).forEach((requirement, i) => {
    if (requirement.id) {
      formData.append(`requirements[${i}][id]`, requirement.id);
    }
    if (requirement.description) {
      formData.append(`requirements[${i}][description]`, requirement.description);
    }
  });

  /** ---------------------- DOCUMENTS ---------------------- **/
  (values.documents ?? []).forEach((doc, i) => {
    if (doc.id) {
      formData.append(`documents[${i}][id]`, doc.id);
    }
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
    formData.append(`documents[${i}][directorySlug]`, String(doc.directorySlug ?? ''));
  });

  /** ---------------------- PLACES ---------------------- **/
  (values.places ?? []).forEach((place, i) => {
    if (place.id) {
      formData.append(`places[${i}][id]`, place.id);
    }
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
      formData.append('stepImages', step.image);

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
  let questionImageFileIndex = 0;

  (values.questions ?? []).forEach((q, i) => {
    if (q.id) {
      formData.append(`questions[${i}][id]`, q.id);
    }

    formData.append(`questions[${i}][questionText]`, q.questionText);
    formData.append(`questions[${i}][type]`, q.type);
    formData.append(`questions[${i}][required]`, String(q.required));
    formData.append(`questions[${i}][description]`, q.description ?? '');
    formData.append(`questions[${i}][options]`, JSON.stringify(q.options ?? []));
    formData.append(`questions[${i}][linkURL]`, q.linkURL ?? '');

    if (q.image instanceof File) {
      formData.append('questionImages', q.image);

      // ✅ Mark which file index belongs to this step
      formData.append(`questions[${i}][fileIndex]`, String(questionImageFileIndex));

      // increment counter for next image
      questionImageFileIndex++;
    } else if (typeof q.imageUrl === 'string' && q.imageUrl.length > 0) {
      // Preserve existing Supabase image URL, stripping token and /object/... prefix
      try {
        const url = new URL(q.imageUrl);
        const pathname = url.pathname;

        // Match after '/object/sign/question/' or '/object/public/question/'
        const match = pathname.match(/\/object\/(?:sign|public)\/questions\/(.+)$/);
        const filename = match ? decodeURIComponent(match[1]) : q.imageUrl;

        // ✅ Strip out the "question/" folder prefix if accidentally included
        const cleanFilename = filename.replace(/^questions\//, '');

        // ✅ Append only the filename (e.g. '1760631676772-xxxx.png')
        formData.append(`questions[${i}][imageUrl]`, cleanFilename);
      } catch {
        // Fallback if it's not a valid URL
        const cleanFilename = q.imageUrl.replace(/^questions\//, '');
        formData.append(`questions[${i}][imageUrl]`, cleanFilename);
      }
    } else {
      // No image at all
      formData.append(`questions[${i}][imageUrl]`, '');
    }
  });

  /** ---------------------- DECLARATIONS ---------------------- **/
  (values.declarations ?? []).forEach((declaration, i) => {
    if (declaration.id) {
      formData.append(`declarations[${i}][id]`, declaration.id);
    }
    if (declaration.title !== undefined) {
      formData.append(`declarations[${i}][title]`, String(declaration.title));
    }
    formData.append(`declarations[${i}][boldText]`, String(declaration.boldText ?? ''));
    formData.append(`declarations[${i}][content]`, String(declaration.content ?? ''));
  });

  /** ---------------------- COMPLETE ORDER DECLARATIONS ---------------------- **/
  (values.completeForms ?? []).forEach((completeForm, i) => {
    if (completeForm.id) {
      formData.append(`completeForms[${i}][id]`, completeForm.id);
    }
    if (completeForm.title !== undefined) {
      formData.append(`completeForms[${i}][title]`, String(completeForm.title));
    }
    formData.append(`completeForms[${i}][boldText]`, String(completeForm.boldText ?? ''));
    formData.append(`completeForms[${i}][content]`, String(completeForm.content ?? ''));
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
  const { data } = await api.get<PaginatedResponse<ProcedureResponse>>('/v1/procedures/admin', {
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
  const { data } = await api.get<ProcedureResponse>('/v1/procedures/admin/detail', {
    params: query,
  });
  return data;
}

// ✅ GET procedure dropdown data
export async function getProcedureDropdown() {
  const { data } = await api.get<ProcedureDropdownResponse>('/v1/procedures/admin/dropdown');
  return data;
}
