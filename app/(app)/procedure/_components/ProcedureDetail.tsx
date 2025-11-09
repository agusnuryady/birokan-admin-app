'use client';

import { useState } from 'react';
import {
  IconBuildings,
  IconDots,
  IconEdit,
  IconFileDescription,
  IconFileText,
  IconHelpCircle,
  IconTrash,
} from '@tabler/icons-react';
import DOMPurify from 'isomorphic-dompurify';
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Image,
  Menu,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { ProcedureDeclarationInput, ProcedureResponse } from '@/services/procedureService';

type ProcedureDetailProps = {
  data?: ProcedureResponse;
  onEdit: () => void;
  onDelete: () => void;
};

function DeclarationItem({ declaration }: { declaration: ProcedureDeclarationInput }) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Paper withBorder p="sm" radius="md">
        <Group align="flex-start" gap="sm">
          <IconFileDescription size={18} />
          <Stack gap={4}>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Title
              </Text>
              <Text fw={500}>{declaration.title}</Text>
            </Stack>
            {declaration.boldText && (
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Bold Words
                </Text>
                <Text fw={500}>{declaration.boldText}</Text>
              </Stack>
            )}
            {declaration.content && (
              <Stack gap={8}>
                <Text size="xs" c="dimmed">
                  Content
                </Text>
                <Button size="xs" variant="light" color="blue" onClick={() => setOpened(true)}>
                  View Detail
                </Button>
              </Stack>
            )}
          </Stack>
        </Group>
      </Paper>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Content" size="lg" centered>
        <Stack gap="sm">
          {declaration.content ? (
            <div
              className="prose max-w-none"
              style={{ whiteSpace: 'normal', lineHeight: '1.75' }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  declaration.content.replace(/<p><\/p>/g, '<p>&nbsp;</p>')
                ),
              }}
            />
          ) : (
            <Text size="sm" c="dimmed">
              No content available
            </Text>
          )}
        </Stack>
      </Modal>
    </>
  );
}

export default function ProcedureDetail({ data, onEdit, onDelete }: ProcedureDetailProps) {
  return (
    <Stack gap="lg">
      {/* ========== DETAIL HEADER ========== */}
      <Paper withBorder radius="md" shadow="sm" p="lg">
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

        <Grid gutter="lg">
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
                  <Text
                    size="sm"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
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
                      <Text size="sm">{data?.duration}</Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Cost
                      </Text>
                      <Text size="sm">
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

        <Divider my="md" />
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            Created at: {data?.createdAt}
          </Text>
          <Text size="xs" c="dimmed">
            Last modified: {data?.updatedAt}
          </Text>
        </Stack>
      </Paper>

      {/* ========== REQUIREMENTS ========== */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Requirements
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          List of requirements for this procedure
        </Text>
        {data?.requirements?.length === 0 && <Divider label="No requirements yet" />}
        <SimpleGrid cols={{ base: 1 }} spacing="md">
          {data?.requirements?.map((req, i) => (
            <Paper key={i} withBorder p="xs" radius="md">
              <Text
                fw={500}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {req.description}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Card>

      {/* ========== DOCUMENTS ========== */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Documents
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          List of documents for this procedure
        </Text>
        {data?.documents?.length === 0 && <Divider label="No documents yet" />}
        <SimpleGrid cols={{ base: 1, '426px': 2, '769px': 3 }} spacing="md">
          {data?.documents?.map((doc, i) => (
            <Paper key={i} withBorder p="sm" radius="md">
              <Group gap="xs">
                <IconFileText size={16} />
                <Text fw={500}>{doc.document?.name}</Text>
              </Group>
              <Text size="sm">Amount: {doc.amount}</Text>
              <Text size="sm">Is Required: {doc.required ? 'True' : 'False'}</Text>
              {doc.directoryId && (
                <Group gap={2}>
                  <Text size="sm">Directory Reference:</Text>
                  <Anchor size="sm" href={`/directories/${doc.directoryId}`}>
                    Go To Directory
                  </Anchor>
                </Group>
              )}
            </Paper>
          ))}
        </SimpleGrid>
      </Card>

      {/* ========== PLACES ========== */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Places
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          List of places for this procedure
        </Text>
        {data?.places?.length === 0 && <Divider label="No places yet" />}
        <SimpleGrid cols={{ base: 1, '426px': 2, '769px': 3 }} spacing="md">
          {data?.places?.map((place, i) => (
            <Paper key={i} withBorder p="sm" radius="md">
              <Group gap="xs">
                <IconBuildings size={16} />
                <Text fw={500}>{place.place?.name}</Text>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Card>

      {/* ========== STEPS ========== */}
      <Card withBorder radius="md" p="md">
        <Text fw={600} mb="sm">
          Steps
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          Sequence of steps for this procedure
        </Text>
        {data?.steps?.length === 0 && <Divider label="No steps yet" />}
        <Stack gap="sm">
          {data?.steps?.map((step, i) => (
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
                      <Text>{step.group}</Text>
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
          ))}
        </Stack>
      </Card>

      {/* ========== QUESTIONS ========== */}
      {data?.isAssistant && (
        <>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">
              Questions
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              List of questions related to this procedure
            </Text>
            {data?.questions?.length === 0 && <Divider label="No questions yet" />}
            <Stack gap="sm">
              {data?.questions?.map((q, i) => (
                <Paper key={i} withBorder p="sm" radius="md">
                  <Group align="flex-start" gap="sm">
                    <IconHelpCircle size={18} />
                    <Stack gap={2}>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Question
                        </Text>
                        <Text fw={500}>{q.questionText}</Text>
                      </Stack>
                      {q.description && (
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            Description
                          </Text>
                          <Text>{q.description}</Text>
                        </Stack>
                      )}
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Is Required
                        </Text>
                        <Badge color={q.required ? 'teal' : 'gray'} radius="sm" variant="filled">
                          {q.required ? 'True' : 'False'}
                        </Badge>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Type
                        </Text>
                        <Text>{q.type}</Text>
                      </Stack>
                      {['SELECT', 'MULTISELECT'].includes(q.type) && q.options?.length > 0 && (
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            Options:
                          </Text>
                          <Text size="sm">{q.options.join(', ')}</Text>
                        </Stack>
                      )}
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </>
      )}

      {/* ========== DECLARATIONS ========== */}
      {data?.isAssistant && (
        <>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">
              Declarations
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              List of declarations for this procedure
            </Text>
            {data?.declarations?.length === 0 && <Divider label="No declarations yet" />}
            <Stack gap="sm">
              {data?.declarations?.map((d, i) => (
                <DeclarationItem key={i} declaration={d} />
              ))}
            </Stack>
            {/* <Stack gap="sm">
              {data?.declarations?.map((d, i) => (
                <Paper key={i} withBorder p="sm" radius="md">
                  <Group align="flex-start" gap="sm">
                    <IconFileDescription size={18} />
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Title
                        </Text>
                        <Text fw={500}>{d.title}</Text>
                      </Stack>
                      {d.boldText && (
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            Bold Words
                          </Text>
                          <Text fw={500}>{d.boldText}</Text>
                        </Stack>
                      )}
                      {d.content && (
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {d.content}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack> */}
          </Card>
        </>
      )}
    </Stack>
  );
}
