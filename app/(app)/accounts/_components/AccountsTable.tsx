'use client';

import { useState } from 'react';
import { IconDots, IconEdit } from '@tabler/icons-react';
import { ActionIcon, Badge, Card, Image, Menu, Paper, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import {
  getUserDetail,
  updateUserAdmin,
  UserFormValues,
  UserResponse,
} from '@/services/userService';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { useUserStore } from '@/store/userStore';
import { notifyApiError } from '@/utils/handleApiError';
import { AccountFormModal } from './AccountFormModal';

export default function AccountsTable() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const { users, total, page, limit, loading, searchUsers, setSearchUsers, fetchUsers } =
    useUserStore();

  const [modalFormUser, setModalFormUser] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<UserResponse | undefined>(undefined);

  const handleEditUser = (User: UserResponse) => {
    setMode('edit');
    fetchUserDetail(User.id);
  };

  const fetchUserDetail = async (id: string) => {
    try {
      showLoading();
      const response = await getUserDetail({ id });
      setSelectedUser(response);
      setModalFormUser(true);
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdateUser = async (id: string, values: UserFormValues) => {
    try {
      showLoading();
      const response = await updateUserAdmin(id, values);
      await fetchUsers();
      await notifications.show({
        title: 'Success',
        message: `You have update ${response.email} User successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <DataTable<UserResponse>
          title="News & Users"
          desc="List of news and Users for Birokan app "
          data={users}
          columns={[
            { accessor: 'id', title: 'ID' },
            {
              accessor: 'image',
              title: 'Profil Picture',
              render: (row) => (
                <>
                  {row.profilePicId ? (
                    <Image src={row.profilePicId} alt={row.email} w={75} h={50} radius="sm" />
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
            { accessor: 'fullName', title: 'Full Name' },
            { accessor: 'gender', title: 'Gender' },
            { accessor: 'email', title: 'Email' },
            { accessor: 'phoneNumber', title: 'Phone Number' },
            { accessor: 'role', title: 'Role' },
            {
              accessor: 'createdAt',
              title: 'Created At',
              render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'),
            },
            {
              accessor: 'isAgent',
              title: 'Is Agent',
              render: (row) => (
                <Badge w={80} color={row.isAgent ? 'green' : 'gray'} variant="filled" radius="sm">
                  {String(row.isAgent)}
                </Badge>
              ),
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
                        handleEditUser(row);
                      }}
                    >
                      Edit
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ),
            },
          ]}
          filters={[
            { accessor: 'isActive', title: 'Status', options: ['Active', 'Inactive'] },
            { accessor: 'isAgent', title: 'Is Agent', options: ['True', 'False'] },
          ]}
          highlightOnHover
          searchable
          page={page}
          limit={limit}
          total={total}
          loading={loading}
          searchValue={searchUsers}
          setSearchValue={setSearchUsers}
          rowKey={(row) => row.id}
          onPageChange={(newPage) => fetchUsers({ page: newPage })}
          onSearch={(search) => fetchUsers({ search, page: 1 })}
          onFilterChange={(key, value) => {
            if (key === 'isActive') {
              fetchUsers({
                page: 1,
                isActive: value ? value === 'Active' : undefined,
              });
            } else if (key === 'isAgent') {
              fetchUsers({
                page: 1,
                isAgent: value ? value === 'True' : undefined,
              });
            }
          }}
        />
      </Card>
      <AccountFormModal
        opened={modalFormUser}
        mode={mode}
        initialValues={selectedUser}
        onClose={() => setModalFormUser(false)}
        onSubmit={(values) => {
          handleUpdateUser(selectedUser?.id || '', values);
        }}
      />
    </>
  );
}
