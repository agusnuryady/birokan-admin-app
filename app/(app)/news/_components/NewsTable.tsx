'use client';

import { useState } from 'react';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Badge, Card, Image, Menu, Paper, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import DataTable from '@/components/DataTable';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import {
  ArticleFormValues,
  ArticleResponse,
  createArticle,
  deleteArticles,
  updateArticle,
} from '@/services/articleService';
import { useArticleStore } from '@/store/articleStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { notifyApiError } from '@/utils/handleApiError';
import { ArticleFormModal } from './ArticleFormModal';

export default function NewsTable() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const {
    articles,
    total,
    page,
    limit,
    loading,
    searchArticles,
    setSearchArticles,
    fetchArticles,
  } = useArticleStore();

  const [modalDeleteArticle, setModalDeleteArticle] = useState(false);
  const [modalFormArticle, setModalFormArticle] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedArticle, setSelectedArticle] = useState<ArticleResponse | undefined>(undefined);

  const handleAddArticle = () => {
    setMode('add');
    setSelectedArticle(undefined);
    setModalFormArticle(true);
  };

  const handleEditArticle = (Article: ArticleResponse) => {
    setMode('edit');
    setSelectedArticle(Article);
    setModalFormArticle(true);
  };

  const handleDeleteArticle = (Article: ArticleResponse) => {
    setSelectedArticle(Article);
    setModalDeleteArticle(true);
  };

  const handleSubmitArticle = async (values: ArticleFormValues) => {
    try {
      showLoading();
      const response = await createArticle(values);
      await fetchArticles({ page: 1 });
      await notifications.show({
        title: 'Success',
        message: `You have created ${response.title} Article successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleUpdateArticle = async (id: string, values: ArticleFormValues) => {
    try {
      showLoading();
      const response = await updateArticle(id, values);
      await fetchArticles();
      await notifications.show({
        title: 'Success',
        message: `You have update ${response.title} Article successfully 🎉`,
        color: 'green',
      });
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  const handleConfirmDeleteArticle = async (ids: string[]) => {
    try {
      showLoading();
      await deleteArticles(ids, false);
      await fetchArticles();
      await notifications.show({
        title: 'Success',
        message: `Article deleted successfully 🎉`,
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
        <DataTable<ArticleResponse>
          title="News & Articles"
          desc="List of news and articles for Birokan app "
          data={articles}
          columns={[
            { accessor: 'id', title: 'ID' },
            {
              accessor: 'image',
              title: 'Image',
              render: (row) => (
                <>
                  {row.imageUrl ? (
                    <Image src={row.imageUrl} alt={row.title} w={75} h={50} radius="sm" />
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
            { accessor: 'title', title: 'Title' },
            { accessor: 'slug', title: 'Slug' },
            { accessor: 'articleDate', title: 'Article Date' },
            { accessor: 'writer', title: 'Writer' },
            { accessor: 'sourceURL', title: 'Source URL' },
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
                        handleEditArticle(row);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArticle(row);
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
          searchValue={searchArticles}
          setSearchValue={setSearchArticles}
          rowKey={(row) => row.id}
          onPageChange={(newPage) => fetchArticles({ page: newPage })}
          onSearch={(search) => fetchArticles({ search, page: 1 })}
          onFilterChange={(_, value) =>
            fetchArticles({ page: 1, isActive: value ? value === 'Active' : undefined })
          }
          handleAddButton={handleAddArticle}
        />
      </Card>
      <ArticleFormModal
        opened={modalFormArticle}
        mode={mode}
        initialValues={selectedArticle}
        onClose={() => setModalFormArticle(false)}
        onSubmit={(values) => {
          if (mode === 'add') {
            handleSubmitArticle(values);
          } else {
            handleUpdateArticle(selectedArticle?.id || '', values);
          }
        }}
      />
      <DeleteFlowModal
        title="Delete Article"
        opened={modalDeleteArticle}
        itemName={selectedArticle?.title || ''}
        confirmText={selectedArticle?.title || ''} // only needed for typeConfirm
        onConfirm={() => {
          setModalDeleteArticle(false);
          handleConfirmDeleteArticle([selectedArticle?.id || '']);
        }}
        onClose={() => setModalDeleteArticle(false)}
      />
    </>
  );
}
