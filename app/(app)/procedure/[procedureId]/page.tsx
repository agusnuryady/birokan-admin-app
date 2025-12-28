'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box, Center, Loader, Text } from '@mantine/core';
import { createProcedure, getProcedureDetail, updateProcedure } from '@/services/procedureService';
import { useProcedureStore } from '@/store/procedureStore';
import { notifyApiError } from '@/utils/handleApiError';
import ProcedureForm from '../_components/ProcedureForm';

export default function ProcedurePage() {
  const router = useRouter();
  const params = useParams<{ procedureId: string }>();
  const searchParams = useSearchParams();

  const { dropdown, fetchDropdown } = useProcedureStore();

  const procedureId = params.procedureId;
  const isEdit = procedureId !== 'new';

  const directoryIdFromQuery = searchParams.get('directoryId');

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // ✏️ EDIT
        if (isEdit) {
          const detail = await getProcedureDetail({ id: procedureId });
          setInitialValues(detail);
        }

        // ➕ ADD
        if (!isEdit) {
          if (!directoryIdFromQuery) {
            // console.error('Missing directoryId for new procedure');
            return;
          }

          setInitialValues({
            directoryId: directoryIdFromQuery,
          });
        }
      } catch (e) {
        notifyApiError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdown();
    load();
  }, [procedureId, isEdit, directoryIdFromQuery, fetchDropdown]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!dropdown) {
    return (
      <Center h={400}>
        <Text c="red">Failed to load data</Text>
      </Center>
    );
  }

  // 🚨 Hard guard (important)
  if (!isEdit && !directoryIdFromQuery) {
    return (
      <Center h={400}>
        <Text c="red">Directory ID is required to create a procedure</Text>
      </Center>
    );
  }

  /* ================= RENDER ================= */

  return (
    <Box px="lg" py="md">
      <ProcedureForm
        mode={isEdit ? 'edit' : 'add'}
        initialValues={initialValues}
        dropdownData={dropdown}
        onSubmit={async (values) => {
          if (isEdit) {
            await updateProcedure(procedureId, values);
          } else {
            await createProcedure(values);
          }

          router.back();
        }}
        // onCancel={() => router.back()}
      />
    </Box>
  );
}
