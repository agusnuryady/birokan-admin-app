'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  deleteProcedures,
  getProcedureDetail,
  ProcedureFormValues,
  ProcedureResponse,
  updateProcedure,
} from '@/services/procedureService';
import { useProcedureStore } from '@/store/procedureStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { notifyApiError } from '@/utils/handleApiError';
import ProcedureDetail from './_components/ProcedureDetail'; // adjust path if needed
import ProcedureModal from './_components/ProcedureModal';

export default function ProcedureDetailPage() {
  const searchParams = useSearchParams();
  const procedureId = searchParams.get('id') || '';
  const router = useRouter();
  const { dropdown, fetchDropdown } = useProcedureStore();

  const { showLoading, hideLoading } = useGlobalLoading();

  const [modalProcedure, setModalProcedure] = useState(false);
  const [modeModalProcedure, setModeModalProcedure] = useState<'add' | 'edit'>('edit');
  const [selectedProcedure, setSelectedProcedure] = useState<
    Partial<ProcedureFormValues> | undefined
  >();
  const [modalDeleteProcedure, setModalDeleteProcedure] = useState(false);
  const [procedureDetail, setProcedureDetail] = useState<ProcedureResponse | undefined>();

  const handleEditProcedure = (procedure: ProcedureResponse) => {
    setModeModalProcedure('edit');
    setSelectedProcedure({
      ...procedure,
    });
    setModalProcedure(true);
  };

  const fetchProcedureDetail = async (id: string) => {
    try {
      showLoading();
      const response = await getProcedureDetail({ id });
      setProcedureDetail(response);
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleConfirmDeleteProcedure = async (ids: string[]) => {
    try {
      showLoading();
      await deleteProcedures(ids, false);
      await notifications.show({
        title: 'Success',
        message: `Procedure deleted successfully 🎉`,
        color: 'green',
      });
      await router.back();
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdateProcedure = async (procedureId: string, values: ProcedureFormValues) => {
    try {
      showLoading();
      const { id, ...rest } = values;
      const response = await updateProcedure(procedureId, rest);
      await fetchProcedureDetail(procedureId);
      await notifications.show({
        title: 'Success',
        message: `You have updated ${response.name} procedure successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchDropdown();
    fetchProcedureDetail(procedureId);
  }, []);

  return (
    <div>
      <ProcedureDetail
        data={procedureDetail}
        onEdit={() => {
          if (procedureDetail) {
            handleEditProcedure(procedureDetail);
          }
        }}
        onDelete={() => {
          setSelectedProcedure(procedureDetail);
          setModalDeleteProcedure(true);
        }}
      />
      <DeleteFlowModal
        title="Delete Procedure"
        opened={modalDeleteProcedure}
        itemName={selectedProcedure?.name || ''}
        confirmText={selectedProcedure?.name || ''} // only needed for typeConfirm
        onConfirm={() => {
          setModalDeleteProcedure(false);
          handleConfirmDeleteProcedure([selectedProcedure?.id || '']);
        }}
        onClose={() => setModalDeleteProcedure(false)}
      />
      <ProcedureModal
        opened={modalProcedure}
        onClose={() => setModalProcedure(false)}
        mode={modeModalProcedure}
        initialValues={selectedProcedure} // pass data for editing
        dropdownData={dropdown}
        onSubmit={(values) => {
          handleUpdateProcedure(selectedProcedure?.id || '', values);
        }}
      />
    </div>
  );
}
