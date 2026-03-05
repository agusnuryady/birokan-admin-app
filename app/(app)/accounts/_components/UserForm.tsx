'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  FileButton,
  Grid,
  Group,
  Image,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { UserFormValues } from '@/services/userService';

interface Props {
  initialValues: UserFormValues;
  procedures: { value: string; label: string }[];
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserForm({ initialValues, procedures, onSubmit }: Props) {
  const router = useRouter();
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [idProofPreviews, setIdProofPreviews] = useState<string[]>([]);
  const [removedProofUrls, setRemovedProofUrls] = useState<string[]>([]);

  const form = useForm<UserFormValues>({
    initialValues: {
      phoneCode: '',
      phoneNumber: '',
      role: '',
      isActive: true,
      isAgent: true,
      agent: {
        profilePicture: null,
        idProofUrls: [],
        idFullName: '',
        residentialAddress: '',
        relativePhoneNumber: '',
        areaOperations: [{ lat: 0, long: 0 }],
        isActive: true,
        procedureIds: [],
      },
      //   ...initialValues,
    },

    validate: {
      role: (value) =>
        !['admin', 'user', 'other'].includes(value || '') ? 'Role type not valid' : null,
    },
  });

  /* ================= INIT (SAME AS MODAL) ================= */

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    form.setValues({
      ...form.values,
      ...initialValues,
      profilePicUrl: initialValues.profilePicUrl ?? null,
      agent: {
        ...initialValues.agent,
        relativePhoneNumber: initialValues.agent?.relativePhoneNumber ?? '',
        procedureIds: initialValues.agent?.procedures?.map((item) => item.procedureId) ?? [],
        idFullName: initialValues.agent?.idFullName ?? '',
      },
    } as UserFormValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- PROFILE PREVIEW ---------------- */

  useEffect(() => {
    const pic = form.values.agent?.profilePicture;

    if (pic instanceof File) {
      const url = URL.createObjectURL(pic);
      setProfilePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (typeof pic === 'string') {
      setProfilePreview(pic);
    }
  }, [form.values.agent?.profilePicture]);

  /* ---------------- ID PROOF PREVIEW ---------------- */

  useEffect(() => {
    const files = form.values.agent?.idProofUrls ?? [];

    const newFileUrls: string[] = [];
    const existingUrls: string[] = [];

    files.forEach((item) => {
      if (item instanceof File) {
        const url = URL.createObjectURL(item);
        newFileUrls.push(url);
      } else if (typeof item === 'string') {
        existingUrls.push(item);
      }
    });

    const allUrls = [...existingUrls, ...newFileUrls];
    setIdProofPreviews(allUrls);

    return () => {
      newFileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.values.agent?.idProofUrls]);

  /* ---------------- AREA FUNCTIONS ---------------- */

  const addAreaOperation = () => {
    const areas = form.values.agent?.areaOperations ?? [];

    form.setFieldValue('agent.areaOperations', [...areas, { lat: 0, long: 0 }]);
  };

  const removeAreaOperation = (index: number) => {
    const areas = form.values.agent?.areaOperations ?? [];

    form.setFieldValue(
      'agent.areaOperations',
      areas.filter((_, i) => i !== index)
    );
  };

  /* ================= PROCEDURES ================= */

  const selectedProcedures = form.values.agent?.procedureIds ?? [];

  const allChecked = procedures.length > 0 && selectedProcedures.length === procedures.length;

  const indeterminate =
    selectedProcedures.length > 0 && selectedProcedures.length < procedures.length;

  const toggleAllProcedures = () => {
    if (allChecked) {
      form.setFieldValue('agent.procedureIds', []);
    } else {
      form.setFieldValue(
        'agent.procedureIds',
        procedures.map((p) => p.value)
      );
    }
  };

  const toggleProcedure = (id: string) => {
    const selected = form.values.agent?.procedureIds ?? [];

    if (selected.includes(id)) {
      form.setFieldValue(
        'agent.procedureIds',
        selected.filter((p) => p !== id)
      );
    } else {
      form.setFieldValue('agent.procedureIds', [...selected, id]);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (values: UserFormValues) => {
    const allIdProofs = values.agent?.idProofUrls ?? [];

    const keepUrls = allIdProofs.filter((item) => typeof item === 'string') as string[];

    const newFiles = allIdProofs.filter((item) => item instanceof File) as File[];

    const cleanUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        const pathname = parsed.pathname;

        const match = pathname.match(/\/object\/(?:sign|public)\/agents\/(.+)$/);

        const filename = match ? decodeURIComponent(match[1]) : url;

        return filename.replace(/^agents\//, '');
      } catch {
        return url.replace(/^agents\//, '');
      }
    };

    const payload: UserFormValues = {
      ...values,
      agent: {
        ...values.agent,
        idProofUrls: newFiles,
        keepIdProofUrls: keepUrls.filter((url) => !removedProofUrls.includes(url)).map(cleanUrl),

        removeIdProofUrls: removedProofUrls.map(cleanUrl),
      },
    };

    await onSubmit(payload);
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {/* USER PROFILE */}
        <Paper withBorder p="md">
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, sm: 3 }}>
              {initialValues?.profilePicUrl ? (
                <Image src={initialValues.profilePicUrl} radius="sm" />
              ) : (
                <Paper
                  withBorder
                  h={104}
                  bg="gray.1"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="sm" c="dimmed">
                    No Image
                  </Text>
                </Paper>
              )}
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 9 }}>
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Full Name
                    </Text>
                    <Text size="sm">{initialValues?.fullName || '-'}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Gender
                    </Text>
                    <Text size="sm" fw={600}>
                      {initialValues?.gender || '-'}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Birth Date
                    </Text>
                    <Text size="sm">{initialValues?.birthDate || '-'}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      ID Card Number
                    </Text>
                    <Text size="sm" fw={600}>
                      {initialValues?.idCardNumber || '-'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 9 }}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Address
                    </Text>
                    <Text size="sm" lineClamp={2}>
                      {initialValues?.address || '-'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* ROLE */}

        <Select label="Role" data={['user', 'admin', 'other']} {...form.getInputProps('role')} />

        {/* STATUS */}

        <Group>
          <Switch
            label="User Active"
            checked={form.values.isActive}
            onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
          />

          <Switch
            label="Agent"
            checked={form.values.isAgent}
            onChange={(e) => form.setFieldValue('isAgent', e.currentTarget.checked)}
          />
        </Group>

        {/* AGENT SECTION */}

        {form.values.isAgent && (
          <Paper withBorder p="md">
            <Stack>
              <Text fw={600}>Agent Information</Text>

              {/* PROFILE PICTURE */}

              <Stack gap={4}>
                <Text fw={500}>Profile Picture</Text>

                {(profilePreview || typeof form.values.agent?.profilePicture === 'string') && (
                  <Image
                    src={profilePreview || (form.values.agent?.profilePicture as string)}
                    w={200}
                  />
                )}

                <FileButton
                  accept="image/*"
                  onChange={(file) => {
                    if (file) {
                      form.setFieldValue('agent.profilePicture', file);
                    }
                  }}
                >
                  {(props) => (
                    <Button {...props} variant="light">
                      Upload Image
                    </Button>
                  )}
                </FileButton>
              </Stack>

              {/* ID PROOF */}

              <Stack>
                <Text fw={500}>ID Proof Documents</Text>

                <Group>
                  {idProofPreviews.map((src, idx) => (
                    <Stack key={idx} align="center">
                      <Image src={src} w={120} h={80} fit="cover" radius="sm" />

                      <Button
                        size="xs"
                        color="red"
                        variant="subtle"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => {
                          const current = form.values.agent?.idProofUrls ?? [];

                          const target = current[idx];

                          if (typeof target === 'string') {
                            setRemovedProofUrls((prev) => [...prev, target]);
                          }

                          form.setFieldValue(
                            'agent.idProofUrls',
                            current.filter((_, i) => i !== idx)
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  ))}
                </Group>

                <FileButton
                  accept="image/*"
                  multiple
                  onChange={(files) => {
                    if (!files) {
                      return;
                    }

                    form.setFieldValue('agent.idProofUrls', [
                      ...(form.values.agent?.idProofUrls ?? []),
                      ...files,
                    ]);
                  }}
                >
                  {(props) => (
                    <Button {...props} variant="light">
                      Add ID Proofs
                    </Button>
                  )}
                </FileButton>
              </Stack>

              {/* AGENT FIELDS */}

              <TextInput label="Full Name (ID)" {...form.getInputProps('agent.idFullName')} />

              <Textarea
                label="Residential Address"
                autosize
                minRows={2}
                {...form.getInputProps('agent.residentialAddress')}
              />

              <TextInput
                label="Relative Phone Number"
                placeholder="Enter relative phone number"
                inputMode="tel"
                required
                {...form.getInputProps('agent.relativePhoneNumber')}
              />

              {/* AREA OPERATIONS */}

              <Group justify="space-between">
                <Text fw={500}>Operational Areas</Text>

                <Button size="xs" variant="light" onClick={addAreaOperation}>
                  Add Area
                </Button>
              </Group>

              {form.values.agent?.areaOperations?.map((_, idx) => (
                <Group key={idx} align="flex-end">
                  <NumberInput
                    label="Latitude"
                    {...form.getInputProps(`agent.areaOperations.${idx}.lat`)}
                  />

                  <NumberInput
                    label="Longitude"
                    {...form.getInputProps(`agent.areaOperations.${idx}.long`)}
                  />

                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => removeAreaOperation(idx)}
                  >
                    Remove
                  </Button>
                </Group>
              ))}

              {/* PROCEDURES */}

              <Text fw={600}>Agent Services</Text>

              <Paper withBorder>
                <ScrollArea h={260}>
                  <Table highlightOnHover striped>
                    <Table.Thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        background: 'white',
                        zIndex: 1,
                      }}
                    >
                      <Table.Tr>
                        {/* MASTER CHECKBOX */}

                        <Table.Th w={50}>
                          <Checkbox
                            checked={allChecked}
                            indeterminate={indeterminate}
                            onChange={toggleAllProcedures}
                          />
                        </Table.Th>

                        <Table.Th>Available Service</Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {procedures.map((proc) => {
                        const checked = selectedProcedures.includes(proc.value);

                        return (
                          <Table.Tr key={proc.value}>
                            <Table.Td>
                              <Checkbox
                                checked={checked}
                                onChange={() => toggleProcedure(proc.value)}
                              />
                            </Table.Td>

                            <Table.Td>{proc.label}</Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>

              <Switch
                label={`Agent ${form.values.agent?.isActive ? 'Active' : 'Inactive'}`}
                checked={form.values.agent?.isActive}
                onChange={(e) => form.setFieldValue('agent.isActive', e.currentTarget.checked)}
              />
            </Stack>
          </Paper>
        )}

        {/* ACTIONS */}

        <Group justify="flex-end">
          <Button variant="default" onClick={() => router.back()}>
            Cancel
          </Button>

          <Button type="submit">Save Changes</Button>
        </Group>
      </Stack>
    </form>
  );
}
