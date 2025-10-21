'use client';

import { useState } from 'react';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Card, Menu, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  createPlace,
  deletePlaces,
  PlaceResponse,
  updatePlace,
  UpdatePlaceDto,
} from '@/services/placeService';
import { usePlaceStore } from '@/store/placeStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { PlaceFormValues } from '@/types/place';
import { PlaceFormModal } from './PlaceFormModal';

export default function PlacesTable() {
  const { places, total, page, limit, loading, searchPlaces, setSearchPlaces, fetchPlaces } =
    usePlaceStore();

  const { showLoading, hideLoading } = useGlobalLoading();
  const [modalDelete, setModalDelete] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedPlace, setSelectedPlace] = useState<PlaceResponse | undefined>(undefined);

  /* ----------------------------- Handlers ----------------------------- */
  const handleAdd = () => {
    setMode('add');
    setSelectedPlace(undefined);
    setModalForm(true);
  };

  const handleEdit = (place: PlaceResponse) => {
    setMode('edit');
    setSelectedPlace(place);
    setModalForm(true);
  };

  const handleDelete = (place: PlaceResponse) => {
    setSelectedPlace(place);
    setModalDelete(true);
  };

  const handleSubmit = async (values: PlaceFormValues) => {
    try {
      showLoading();
      const response = await createPlace(values);
      await fetchPlaces({ page: 1 });
      notifications.show({
        title: 'Success',
        message: `Place "${response.name}" created successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      hideLoading();
    }
  };

  const handleUpdate = async (id: string, values: PlaceFormValues) => {
    try {
      showLoading();
      const payload: UpdatePlaceDto = {
        name: values.name,
        desc: values.desc,
      };
      const response = await updatePlace(id, payload);
      await fetchPlaces();
      notifications.show({
        title: 'Success',
        message: `Place "${response.name}" updated successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      hideLoading();
    }
  };

  const handleConfirmDelete = async (ids: string[]) => {
    try {
      showLoading();
      await deletePlaces(ids);
      await fetchPlaces();
      notifications.show({
        title: 'Success',
        message: `Place deleted successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      hideLoading();
    }
  };

  /* --------------------------- Render --------------------------- */
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <DataTable<PlaceResponse>
          title="Places"
          desc="List of registered places in the Birokan app"
          data={places}
          columns={[
            { accessor: 'id', title: 'ID' },
            { accessor: 'name', title: 'Name' },
            {
              accessor: 'desc',
              title: 'Description',
              render: (row) => (
                <Text lineClamp={2} size="sm" maw={200}>
                  {row.desc || '-'}
                </Text>
              ),
            },
            { accessor: 'locationCount', title: 'Locations' },
            {
              accessor: 'createdAt',
              title: 'Created At',
              render: (row) =>
                row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB') : '-',
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
                        handleEdit(row);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row);
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
          page={page}
          limit={limit}
          total={total}
          loading={loading}
          searchValue={searchPlaces}
          setSearchValue={setSearchPlaces}
          rowKey={(row) => row.id}
          onPageChange={(newPage) => fetchPlaces({ page: newPage })}
          onSearch={(search) => fetchPlaces({ search, page: 1 })}
          handleAddButton={handleAdd}
        />
      </Card>

      {/* Form Modal */}
      <PlaceFormModal
        opened={modalForm}
        mode={mode}
        initialValues={selectedPlace}
        onClose={() => setModalForm(false)}
        onSubmit={(values) => {
          if (mode === 'add') {
            handleSubmit(values);
          } else {
            handleUpdate(selectedPlace?.id || '', values);
          }
        }}
      />

      {/* Delete Modal */}
      <DeleteFlowModal
        title="Delete Place"
        opened={modalDelete}
        itemName={selectedPlace?.name || ''}
        confirmText={selectedPlace?.name || ''}
        onConfirm={() => {
          setModalDelete(false);
          handleConfirmDelete([selectedPlace?.id || '']);
        }}
        onClose={() => setModalDelete(false)}
      />
    </>
  );
}
