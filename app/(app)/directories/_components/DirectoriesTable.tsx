'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Badge, Card, Image, Menu, Paper, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  createDirectory,
  deleteDirectories,
  DirectoryResponse,
  updateDirectory,
} from '@/services/directoryService';
import { useDirectoryStore } from '@/store/directoryStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { DirectoryFormModal, DirectoryFormValues } from './DirectoryFormModal';

export default function DirectoriesTable() {
  const router = useRouter();

  const { showLoading, hideLoading } = useGlobalLoading();
  const {
    directories,
    total,
    page,
    limit,
    loading,
    searchDirectories,
    setSearchDirectories,
    fetchDirectories,
  } = useDirectoryStore();

  const [modalDeleteDirectory, setModalDeleteDirectory] = useState(false);
  const [modalFormDirectory, setModalFormDirectory] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryResponse | undefined>(
    undefined
  );

  const handleAddDirectory = () => {
    setMode('add');
    setSelectedDirectory(undefined);
    setModalFormDirectory(true);
  };

  const handleEditDirectory = (directory: DirectoryResponse) => {
    setMode('edit');
    setSelectedDirectory(directory);
    setModalFormDirectory(true);
  };

  const handleDeleteDirectory = (directory: DirectoryResponse) => {
    setSelectedDirectory(directory);
    setModalDeleteDirectory(true);
  };

  const handleSubmitDirectory = async (values: DirectoryFormValues) => {
    try {
      showLoading();
      const response = await createDirectory(values);
      await fetchDirectories({ page: 1 });
      await notifications.show({
        title: 'Success',
        message: `You have created ${response.name} directory successfully 🎉`,
        color: 'green',
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
      hideLoading();
    }
  };

  const handleUpdateDirectory = async (id: string, values: DirectoryFormValues) => {
    try {
      showLoading();
      const response = await updateDirectory(id, values);
      await fetchDirectories();
      await notifications.show({
        title: 'Success',
        message: `You have update ${response.name} directory successfully 🎉`,
        color: 'green',
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
      hideLoading();
    }
  };

  const handleConfirmDeleteDirectory = async (ids: string[]) => {
    try {
      showLoading();
      await deleteDirectories(ids, false);
      await fetchDirectories();
      await notifications.show({
        title: 'Success',
        message: `Directory deleted successfully 🎉`,
        color: 'green',
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
      hideLoading();
    }
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <DataTable<DirectoryResponse>
          title="Directories"
          desc="List of legal document directories for Birokan app"
          data={directories}
          columns={[
            { accessor: 'id', title: 'ID' },
            {
              accessor: 'image',
              title: 'Image',
              render: (row) => (
                <>
                  {row.imageUrl ? (
                    <Image src={row.imageUrl} alt={row.name} w={75} h={50} radius="sm" />
                  ) : (
                    <Paper
                      withBorder
                      radius="sm"
                      w={75}
                      h={50}
                      bg="gray.1"
                      display="flex"
                      style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text size="xs" c="dimmed">
                        No Image
                      </Text>
                    </Paper>
                  )}
                </>
              ),
            },
            { accessor: 'name', title: 'Name' },
            { accessor: 'slug', title: 'Slug' },
            { accessor: 'procedureCount', title: 'Procedures' },
            {
              accessor: 'createdAt',
              title: 'Created At',
              render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'),
            },
            {
              accessor: 'updatedAt',
              title: 'Updated At',
              render: (row) => new Date(row.updatedAt).toLocaleDateString('en-GB'),
            },
            {
              accessor: 'isActive',
              title: 'Status',
              render: (row) => (
                <Badge w={80} color={row.isActive ? 'green' : 'gray'} variant="filled" radius="sm">
                  {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              accessor: 'actions',
              title: 'Actions',
              render: (row) => (
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDirectory(row);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDirectory(row);
                      }}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ),
            },
          ]}
          filters={[{ accessor: 'status', title: 'Status', options: ['Active', 'Inactive'] }]}
          highlightOnHover
          searchable
          page={page}
          limit={limit}
          total={total}
          loading={loading}
          searchValue={searchDirectories}
          setSearchValue={setSearchDirectories}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/directories/${row.id}`)}
          onPageChange={(newPage) => fetchDirectories({ page: newPage })}
          onSearch={(search) => fetchDirectories({ search, page: 1 })}
          onFilterChange={(_, value) =>
            fetchDirectories({ page: 1, isActive: value ? value === 'Active' : undefined })
          }
          handleAddButton={handleAddDirectory}
        />
      </Card>
      <DirectoryFormModal
        opened={modalFormDirectory}
        mode={mode}
        initialValues={selectedDirectory}
        onClose={() => setModalFormDirectory(false)}
        onSubmit={(values) => {
          if (mode === 'add') {
            handleSubmitDirectory(values);
          } else {
            handleUpdateDirectory(selectedDirectory?.id || '', values);
          }
        }}
      />
      <DeleteFlowModal
        title="Delete Directory"
        opened={modalDeleteDirectory}
        itemName={selectedDirectory?.name || ''}
        confirmText={selectedDirectory?.name || ''} // only needed for typeConfirm
        onConfirm={() => {
          setModalDeleteDirectory(false);
          handleConfirmDeleteDirectory([selectedDirectory?.id || '']);
        }}
        onClose={() => setModalDeleteDirectory(false)}
      />
    </>
  );
}
