'use client';

import { IconBuildings, IconDots, IconEdit, IconFileText, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Card,
  Divider,
  Grid,
  Group,
  Image,
  Menu,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { ProcedureResponse } from '@/services/procedureService';

type ProcedureDetailProps = {
  data?: ProcedureResponse;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProcedureDetail({ data, onEdit, onDelete }: ProcedureDetailProps) {
  return (
    <Stack gap="lg">
      {/* Detail Header */}
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
              <Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>
                Edit
              </Menu.Item>
              <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Body */}
        <Grid gutter="lg">
          {/* Details */}
          <Grid.Col span={{ base: 12 }}>
            <Grid gutter="md">
              <Grid.Col span={4}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Directory
                  </Text>
                  <Text size="sm" fw={600}>
                    {data?.directory?.name}
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={4}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Name
                  </Text>
                  <Text size="sm" fw={600}>
                    {data?.name}
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={4}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Slug
                  </Text>
                  <Text size="sm">{data?.slug}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={4}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Status
                  </Text>
                  <Badge color={data?.isActive ? 'teal' : 'gray'} radius="sm" variant="filled">
                    {data?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Stack>
              </Grid.Col>
              <Grid.Col span={8}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Description
                  </Text>
                  <Text size="sm" lineClamp={2}>
                    {data?.description}
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={4}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Is Assistant
                  </Text>
                  <Badge color={data?.isAssistant ? 'teal' : 'gray'} radius="sm" variant="filled">
                    {data?.isAssistant ? 'True' : 'False'}
                  </Badge>
                </Stack>
              </Grid.Col>
              {data?.isAssistant && (
                <>
                  <Grid.Col span={4}>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Duration (in days)
                      </Text>
                      <Text size="sm" lineClamp={2}>
                        {data?.duration}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Cost
                      </Text>
                      <Text size="sm" lineClamp={2}>
                        {data?.cost
                          ? new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            }).format(data?.cost)
                          : '-'}
                      </Text>
                    </Stack>
                  </Grid.Col>
                </>
              )}
            </Grid>
          </Grid.Col>
        </Grid>

        {/* Footer */}
        <Divider my="md" />
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            Created at: {data?.createdAt}
            {/* by {lastModifiedBy} */}
          </Text>
          <Text size="xs" c="dimmed">
            Last modified: {data?.updatedAt}
            {/* by {lastModifiedBy} */}
          </Text>
        </Stack>
      </Paper>

      {/* Documents */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Documents
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          List of documents for this procedure
        </Text>
        <SimpleGrid type="container" cols={{ base: 1, '426px': 2, '769px': 3 }} spacing="md">
          {data?.documents
            ? data.documents.map((doc, i) => (
                <Paper key={i} withBorder p="sm" radius="md">
                  <Group gap="xs">
                    <IconFileText size={16} />
                    <Text fw={500}>{doc.document?.name}</Text>
                  </Group>
                  <Text size="sm">Amount: {doc.amount}</Text>
                  <Text size="sm">Is Required: {doc.required ? 'True' : 'False'}</Text>
                </Paper>
              ))
            : null}
        </SimpleGrid>
      </Card>

      {/* Places */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Places
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          List of places for this procedure
        </Text>
        <SimpleGrid type="container" cols={{ base: 1, '426px': 2, '769px': 3 }} spacing="md">
          {data?.places
            ? data.places.map((place, i) => (
                <Paper key={i} withBorder p="sm" radius="md">
                  <Group gap="xs">
                    <IconBuildings size={16} />
                    <Text fw={500}>{place.place?.name}</Text>
                  </Group>
                </Paper>
              ))
            : null}
        </SimpleGrid>
      </Card>

      {/* Steps */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Steps
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          Sequence of steps for this procedure
        </Text>
        <Stack gap="sm">
          {data?.steps
            ? data.steps.map((step, i) => (
                <Paper key={i} withBorder p="sm" radius="md">
                  <Group gap="md" align="flex-start">
                    <Badge circle size="xl" color="blue" variant="filled">
                      {step.order}
                    </Badge>
                    <Stack style={{ flex: 1 }} gap="xs">
                      {step.group && (
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            Group
                          </Text>
                          <Text lineClamp={2}>{step.group}</Text>
                        </Stack>
                      )}
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Description
                        </Text>
                        <Text fw={500}>{step.description}</Text>
                      </Stack>
                      {step.linkURL && (
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            Link
                          </Text>
                          <Anchor href={`https://${step.linkURL}`} target="_blank">
                            {step.linkURL}
                          </Anchor>
                        </Stack>
                      )}
                      {step.imageUrl && (
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            Image
                          </Text>
                          <Image
                            src={step.imageUrl}
                            alt={`image-${step.order}`}
                            radius="md"
                            w={280}
                            fit="contain"
                          />
                        </Stack>
                      )}
                    </Stack>
                  </Group>
                </Paper>
              ))
            : null}
        </Stack>
      </Card>
    </Stack>
  );
}
