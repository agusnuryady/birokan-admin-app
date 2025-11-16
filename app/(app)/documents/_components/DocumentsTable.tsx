'use client';

import { useState } from 'react';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Card, Menu, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  createDocument,
  deleteDocuments,
  DocumentResponse,
  updateDocument,
  UpdateDocumentDto,
} from '@/services/documentService';
import { useDocumenStore } from '@/store/documentStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { notifyApiError } from '@/utils/handleApiError';
import { DocumentFormModal, DocumentFormValues } from './DocumentFormModal';

export default function DocumentsTable() {
  const {
    documents,
    total,
    page,
    limit,
    loading,
    searchDocuments,
    optionsDefaultValue,
    setSearchDocuments,
    fetchDocuments,
  } = useDocumenStore();

  const { showLoading, hideLoading } = useGlobalLoading();
  const [modalDelete, setModalDelete] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | undefined>(undefined);

  /* ----------------------------- Handlers ----------------------------- */
  const handleAdd = () => {
    setMode('add');
    setSelectedDoc(undefined);
    setModalForm(true);
  };

  const handleEdit = (doc: DocumentResponse) => {
    setMode('edit');
    setSelectedDoc(doc);
    setModalForm(true);
  };

  const handleDelete = (doc: DocumentResponse) => {
    setSelectedDoc(doc);
    setModalDelete(true);
  };

  const handleSubmit = async (values: DocumentFormValues) => {
    try {
      showLoading();
      const response = await createDocument(values);
      await fetchDocuments({ page: 1 });
      notifications.show({
        title: 'Success',
        message: `Document ${response.name} created successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdate = async (id: string, values: DocumentFormValues) => {
    try {
      showLoading();
      const payload: UpdateDocumentDto = {
        name: values.name,
        type: values.type,
        desc: values.desc,
      };
      const response = await updateDocument(id, payload);
      await fetchDocuments();
      notifications.show({
        title: 'Success',
        message: `Document ${response.name} updated successfully 🎉`,
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
      await deleteDocuments(ids);
      await fetchDocuments();
      notifications.show({
        title: 'Success',
        message: `Document deleted successfully 🎉`,
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
        <DataTable<DocumentResponse>
          title="Documents"
          desc="List of document types for Birokan app"
          data={documents}
          columns={[
            { accessor: 'id', title: 'ID' },
            { accessor: 'name', title: 'Name' },
            { accessor: 'type', title: 'Type' },
            {
              accessor: 'desc',
              title: 'Description',
              render: (row) => (
                <Text lineClamp={2} size="sm" maw={200}>
                  {row.desc}
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
            // { accessor: 'status', title: 'Status', options: ['Active', 'Inactive'] },
            { accessor: 'type', title: 'Type', options: optionsDefaultValue },
          ]}
          highlightOnHover
          searchable
          page={page}
          limit={limit}
          total={total}
          loading={loading}
          searchValue={searchDocuments}
          setSearchValue={setSearchDocuments}
          rowKey={(row) => row.id}
          onPageChange={(newPage) => fetchDocuments({ page: newPage })}
          onSearch={(search) => fetchDocuments({ search, page: 1 })}
          onFilterChange={(key, value) => {
            if (key === 'status') {
              fetchDocuments({
                page: 1,
                isActive: value ? value === 'Active' : undefined,
              });
            } else if (key === 'type') {
              fetchDocuments({
                page: 1,
                type: (value as string) || undefined,
              });
            }
          }}
          handleAddButton={handleAdd}
        />
      </Card>

      {/* Form Modal */}
      <DocumentFormModal
        opened={modalForm}
        mode={mode}
        initialValues={selectedDoc}
        defaultOptions={optionsDefaultValue}
        onClose={() => setModalForm(false)}
        onSubmit={(values) => {
          if (mode === 'add') {
            handleSubmit(values);
          } else {
            handleUpdate(selectedDoc?.id || '', values);
          }
        }}
      />

      {/* Delete Modal */}
      <DeleteFlowModal
        title="Delete Document"
        opened={modalDelete}
        itemName={selectedDoc?.name || ''}
        confirmText={selectedDoc?.name || ''}
        onConfirm={() => {
          setModalDelete(false);
          handleConfirmDelete([selectedDoc?.id || '']);
        }}
        onClose={() => setModalDelete(false)}
      />
    </>
  );
}
