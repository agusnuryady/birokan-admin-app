'use client';

import { useState } from 'react';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Card, Menu, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  createVoucher,
  deleteVouchers,
  updateVoucher,
  VoucherResponse,
} from '@/services/voucherService';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { useVoucherStore } from '@/store/voucherStore';
import { notifyApiError } from '@/utils/handleApiError';
import { VoucherFormModal, VoucherFormValues } from './VoucherFormModal';

export default function VouchersTable() {
  const { vouchers, total, page, limit, loading, search, setSearch, fetchVouchers } =
    useVoucherStore();

  const { showLoading, hideLoading } = useGlobalLoading();
  const [modalDelete, setModalDelete] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | undefined>(undefined);

  /* ----------------------------- Handlers ----------------------------- */
  const handleAdd = () => {
    setMode('add');
    setSelectedVoucher(undefined);
    setModalForm(true);
  };

  const handleEdit = (voucher: VoucherResponse) => {
    setMode('edit');
    setSelectedVoucher(voucher);
    setModalForm(true);
  };

  const handleDelete = (voucher: VoucherResponse) => {
    setSelectedVoucher(voucher);
    setModalDelete(true);
  };

  const handleSubmit = async (values: VoucherFormValues) => {
    try {
      showLoading();
      const response = await createVoucher(values);
      await fetchVouchers({ page: 1 });
      notifications.show({
        title: 'Success',
        message: `Voucher ${response.title} created successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdate = async (id: string, values: VoucherFormValues) => {
    try {
      showLoading();
      const response = await updateVoucher(id, values);
      await fetchVouchers();
      notifications.show({
        title: 'Success',
        message: `Voucher ${response.title} updated successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleConfirmDelete = async (ids: string[]) => {
    try {
      showLoading();
      await deleteVouchers(ids);
      await fetchVouchers();
      notifications.show({
        title: 'Success',
        message: 'Voucher deleted successfully 🎉',
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  /* --------------------------- Render --------------------------- */
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <DataTable<VoucherResponse>
          title="Vouchers"
          desc="List of vouchers for Birokan app"
          data={vouchers}
          columns={[
            { accessor: 'code', title: 'Code' },
            { accessor: 'title', title: 'Title' },
            { accessor: 'discountType', title: 'Discount Type' },
            { accessor: 'discountValue', title: 'Value' },
            { accessor: 'usedCount', title: 'Used Count' },
            {
              accessor: 'isActive',
              title: 'Status',
              render: (row) => (
                <Text c={row.isActive ? 'green' : 'red'}>
                  {row.isActive ? 'Active' : 'Inactive'}
                </Text>
              ),
            },
            {
              accessor: 'createdAt',
              title: 'Created At',
              render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'),
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
          filters={[
            {
              accessor: 'discountType',
              title: 'Discount Type',
              options: ['PERCENTAGE', 'FIXED'],
            },
            {
              accessor: 'isActive',
              title: 'Status',
              options: ['Active', 'Inactive'],
            },
          ]}
          searchable
          highlightOnHover
          loading={loading}
          page={page}
          limit={limit}
          total={total}
          searchValue={search}
          setSearchValue={setSearch}
          rowKey={(row) => row.id}
          onPageChange={(newPage) => fetchVouchers({ page: newPage })}
          onSearch={(search) => fetchVouchers({ search, page: 1 })}
          // onSortChange={(sortBy, order) => fetchVouchers({ sortBy, order })}
          onFilterChange={(key, value) => {
            if (key === 'isActive') {
              fetchVouchers({
                page: 1,
                isActive: value ? value === 'Active' : undefined,
              });
            } else if (key === 'discountType') {
              fetchVouchers({
                page: 1,
                discountType: value ? (value as 'PERCENTAGE' | 'FIXED') : undefined,
              });
            }
          }}
          handleAddButton={handleAdd}
        />
      </Card>

      {/* Form Modal */}
      <VoucherFormModal
        opened={modalForm}
        mode={mode}
        initialValues={selectedVoucher}
        onClose={() => setModalForm(false)}
        onSubmit={(values) => {
          if (mode === 'add') {
            handleSubmit(values);
          } else {
            handleUpdate(selectedVoucher?.id || '', values);
          }
        }}
      />

      {/* Delete Modal */}
      <DeleteFlowModal
        title="Delete Voucher"
        opened={modalDelete}
        itemName={selectedVoucher?.title || ''}
        confirmText={selectedVoucher?.title || ''}
        onConfirm={() => {
          setModalDelete(false);
          handleConfirmDelete([selectedVoucher?.id || '']);
        }}
        onClose={() => setModalDelete(false)}
      />
    </>
  );
}
