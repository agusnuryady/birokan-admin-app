'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box, Center, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  createProcedure,
  getProcedureDetail,
  ProcedureFormValues,
  updateProcedure,
} from '@/services/procedureService';
import { useProcedureStore } from '@/store/procedureStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { notifyApiError } from '@/utils/handleApiError';
import ProcedureForm from '../_components/ProcedureForm';

export default function ProcedurePage() {
  const router = useRouter();
  const params = useParams<{ procedureId: string }>();
  const searchParams = useSearchParams();

  const { dropdown, fetchDropdown } = useProcedureStore();
  const { showLoading, hideLoading } = useGlobalLoading();

  const procedureId = params.procedureId;
  const isEdit = procedureId !== 'new';

  const directoryIdFromQuery = searchParams.get('directoryId');

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);

  const handleConfirm = useCallback(
    async (values: ProcedureFormValues) => {
      try {
        showLoading();
        if (isEdit) {
          await updateProcedure(procedureId, values);
        } else {
          await createProcedure(values);
        }

        await notifications.show({
          title: 'Success',
          message: `Procedure has been ${isEdit ? 'updated' : 'created'} 🎉`,
          color: 'green',
        });
        router.back();
      } catch (error: any) {
        notifyApiError(error);
      } finally {
        hideLoading();
      }
    },
    [hideLoading, isEdit, procedureId, router, showLoading]
  );

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
        onSubmit={handleConfirm}
        // onCancel={() => router.back()}
      />
    </Box>
  );
}
