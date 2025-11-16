'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Badge, Card, Menu, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  deleteDirectories,
  DirectoryResponse,
  getDirectoryDetail,
  updateDirectory,
} from '@/services/directoryService';
import {
  createProcedure,
  deleteProcedures,
  getProcedureDetail,
  ProcedureFormValues,
  ProcedureResponse,
  updateProcedure,
} from '@/services/procedureService';
import { useProcedureStore } from '@/store/procedureStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { notifyApiError } from '@/utils/handleApiError';
// your reusable table
import { DirectoryFormValues } from '../_components/DirectoryFormModal';
import ProcedureModal from '../../procedure/_components/ProcedureModal';
import { DetailCard } from './_components/DetailCard';

export default function DirectoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const directoryId = params.directoryId as string;

  const { showLoading, hideLoading } = useGlobalLoading();
  const {
    procedures,
    dropdown,
    total,
    page,
    limit,
    loading,
    searchProcedures,
    setSearchProcedures,
    fetchProcedures,
    fetchDropdown,
  } = useProcedureStore();

  const [directoryDetail, setDirectoryDetail] = useState<DirectoryResponse | undefined>();
  const [modalProcedure, setModalProcedure] = useState(false);
  const [modeModalProcedure, setModeModalProcedure] = useState<'add' | 'edit'>('add');
  const [selectedProcedure, setSelectedProcedure] = useState<
    Partial<ProcedureFormValues> | undefined
  >();
  const [modalDeleteProcedure, setModalDeleteProcedure] = useState(false);

  const handleAddProcedure = () => {
    setModeModalProcedure('add');
    setSelectedProcedure({
      directoryId,
    });
    setModalProcedure(true);
  };

  const handleEditProcedure = (procedure: ProcedureResponse) => {
    setModeModalProcedure('edit');
    fetchProcedureDetail(procedure.id);
  };

  const handleDeleteProcedure = (procedure: ProcedureResponse) => {
    setSelectedProcedure(procedure);
    setModalDeleteProcedure(true);
  };

  const fetchDirectoryDetail = async (id: string) => {
    try {
      showLoading();
      const response = await getDirectoryDetail({ id });
      setDirectoryDetail(response);
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdateDirectory = async (id: string, values: DirectoryFormValues) => {
    try {
      showLoading();
      const response = await updateDirectory(id, values);
      await fetchDirectoryDetail(directoryDetail?.id || '');
      await notifications.show({
        title: 'Success',
        message: `You have update ${response.name} directory successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleConfirmDeleteDirectory = async (ids: string[]) => {
    try {
      showLoading();
      await deleteDirectories(ids, false);
      await notifications.show({
        title: 'Success',
        message: `Directory deleted successfully 🎉`,
        color: 'green',
      });
      await router.back();
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const fetchProcedureDetail = async (id: string) => {
    try {
      showLoading();
      const response = await getProcedureDetail({ id });
      const { createdAt, updatedAt, directory, ...rest } = response;
      setSelectedProcedure(rest);
      setModalProcedure(true);
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleSubmitProcedure = async (values: ProcedureFormValues) => {
    try {
      showLoading();
      const response = await createProcedure(values);
      await fetchProcedures({ directoryId, page: 1 });
      await notifications.show({
        title: 'Success',
        message: `You have created ${response.name} procedure successfully 🎉`,
        color: 'green',
      });
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
      await fetchProcedures({ directoryId, page: 1 });
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

  const handleConfirmDeleteProcedure = async (ids: string[]) => {
    try {
      showLoading();
      await deleteProcedures(ids, false);
      await fetchProcedures();
      await notifications.show({
        title: 'Success',
        message: `Procedure deleted successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchDirectoryDetail(directoryId);
    fetchDropdown();
  }, []);

  return (
    <Stack gap="lg">
      {/* Detail Card */}
      <DetailCard
        data={directoryDetail}
        onSubmitEdit={handleUpdateDirectory}
        onSubmitDelete={handleConfirmDeleteDirectory}
      />
      {/* Procedures Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <DataTable
          title="Procedures"
          desc="List of legal document procedures for Birokan app"
          data={procedures}
          columns={[
            { accessor: 'id', title: 'Id', searchable: true },
            { accessor: 'name', title: 'Name', searchable: true },
            { accessor: 'slug', title: 'Slug', searchable: true },
            {
              accessor: 'isAssistant',
              title: 'Is Assistant',
              render: (row) => (
                <Badge color={row.isAssistant ? 'green' : 'gray'}>
                  {row.isAssistant ? 'True' : 'False'}
                </Badge>
              ),
            },
            {
              accessor: 'status',
              title: 'Status',
              render: (row) => (
                <Badge color={row.isActive ? 'green' : 'gray'}>
                  {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              accessor: 'actions',
              title: 'Action',
              render: (row) => (
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProcedure(row);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProcedure(row);
                      }}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ),
            },
          ]}
          searchable
          highlightOnHover
          striped
          filters={[
            { accessor: 'isActive', title: 'Status', options: ['Active', 'Inactive'] },
            { accessor: 'isAssistant', title: 'Is Assistant', options: ['true', 'false'] },
          ]}
          handleAddButton={handleAddProcedure}
          page={page}
          limit={limit}
          total={total}
          loading={loading}
          searchValue={searchProcedures}
          setSearchValue={setSearchProcedures}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/procedure?id=${row.id}`)}
          onPageChange={(newPage) => fetchProcedures({ directoryId, page: newPage })}
          onSearch={(search) => fetchProcedures({ directoryId, search, page: 1 })}
          onFilterChange={(key, value) => {
            if (key === 'ALL_FILTERS' && typeof value === 'object') {
              // 🔹 you get ALL active filters here
              fetchProcedures({
                directoryId,
                page: 1,
                ...value,
                isActive: value.isActive ? value.isActive === 'Active' : undefined,
                isAssistant: value.isAssistant ? value.isAssistant === 'true' : undefined,
              });
            }
            // if (key === 'isActive') {
            //   fetchProcedures({
            //     directoryId,
            //     page: 1,
            //     isActive: value ? value === 'Active' : undefined,
            //     isAssistant: value ? value === 'true' : undefined,
            //   });
            // } else if (key === 'isAssistant') {
            //   fetchProcedures({
            //     directoryId,
            //     page: 1,
            //     isActive: value ? value === 'Active' : undefined,
            //     isAssistant: value ? value === 'true' : undefined,
            //   });
            // }
          }}
        />
      </Card>
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
          if (modeModalProcedure === 'add') {
            handleSubmitProcedure(values);
          } else {
            handleUpdateProcedure(selectedProcedure?.id || '', values);
          }
        }}
      />
      ;
    </Stack>
  );
}
