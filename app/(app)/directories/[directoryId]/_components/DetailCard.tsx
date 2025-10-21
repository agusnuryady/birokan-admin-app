'use client';

import { useState } from 'react';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Divider,
  Grid,
  Group,
  Image,
  Menu,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { DeleteFlowModal } from '@/components/DeleteFlowModal';
import { DirectoryResponse } from '@/services/directoryService';
import { DirectoryFormModal, DirectoryFormValues } from '../../_components/DirectoryFormModal';

export function DetailCard({
  data,
  onSubmitEdit,
  onSubmitDelete,
}: {
  data?: DirectoryResponse;
  onSubmitEdit: (id: string, values: DirectoryFormValues) => void;
  onSubmitDelete: (ids: string[]) => void;
}) {
  const [modalDeleteDirectory, setModalDeleteDirectory] = useState(false);
  const [modalFormDirectory, setModalFormDirectory] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryFormValues | undefined>(
    undefined
  );

  const handleEditDirectory = (directory?: DirectoryResponse) => {
    if (directory) {
      setMode('edit');
      setSelectedDirectory(directory);
      setModalFormDirectory(true);
    }
  };

  return (
    <>
      <Paper withBorder radius="md" shadow="sm" p="lg">
        {/* Header */}
        <Group justify="space-between" mb="md">
          <Text fw={600}>Detail</Text>
          <Menu shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" radius="xl">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditDirectory(data);
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDirectory(data);
                  setModalDeleteDirectory(true);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Body */}
        <Grid gutter="lg">
          {/* Image */}
          <Grid.Col span={{ base: 12, sm: 3 }}>
            {data?.imageUrl ? (
              <Image src={data.imageUrl} alt={data.name} radius="sm" />
            ) : (
              <Paper
                withBorder
                radius="sm"
                h={160}
                bg="gray.1"
                display="flex"
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <Text size="sm" c="dimmed">
                  No Image
                </Text>
              </Paper>
            )}
          </Grid.Col>

          {/* Details */}
          <Grid.Col span={{ base: 12, sm: 9 }}>
            <Grid gutter="md">
              <Grid.Col span={6}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Id
                  </Text>
                  <Text size="sm">{data?.id || '-'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={6}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Slug
                  </Text>
                  <Text size="sm">{data?.slug || '-'}</Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Name
                  </Text>
                  <Text size="sm" fw={600}>
                    {data?.name || '-'}
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={6}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Created At
                  </Text>
                  <Text size="sm" fw={600}>
                    {data?.createdAt || '-'}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Description
                  </Text>
                  <Text size="sm" lineClamp={2}>
                    {data?.description || '-'}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Status
                  </Text>
                  {data?.isActive !== undefined ? (
                    <Badge color={data.isActive ? 'teal' : 'gray'} radius="sm" variant="filled">
                      {data.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>

        {/* Footer */}
        <Divider my="md" />
        <Text size="xs" c="dimmed">
          Last modified: {new Date(data?.updatedAt || '').toLocaleDateString('en-GB')}
        </Text>
      </Paper>
      <DirectoryFormModal
        opened={modalFormDirectory}
        mode={mode}
        initialValues={selectedDirectory}
        onClose={() => setModalFormDirectory(false)}
        onSubmit={(values: any) => {
          onSubmitEdit(data?.id || '', values);
        }}
      />
      <DeleteFlowModal
        title="Delete Directory"
        opened={modalDeleteDirectory}
        itemName={selectedDirectory?.name || ''}
        confirmText={selectedDirectory?.name || ''} // only needed for typeConfirm
        onConfirm={() => {
          setModalDeleteDirectory(false);
          onSubmitDelete([data?.id || '']);
        }}
        onClose={() => setModalDeleteDirectory(false)}
      />
    </>
  );
}
