import { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  FileButton,
  Grid,
  Group,
  Image,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { UserFormValues } from '@/services/userService';

interface AccountFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: UserFormValues;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

export function AccountFormModal({
  opened,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: AccountFormModalProps) {
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
        profilePicture: '',
        idProofUrls: [],
        idFullName: '',
        residentialAddress: '',
        relativePhoneNumber: '',
        areaOperations: [{ lat: 0, long: 0 }],
        isActive: true,
      },
      ...initialValues, // merge when editing
    },
    validate: {
      role: (value) =>
        !['admin', 'user', 'other'].includes(value || '') ? 'Role type not valid' : null,
    },
  });

  useEffect(() => {
    if (opened) {
      if (initialValues) {
        // merge carefully to avoid undefined
        form.setValues({
          ...form.values,
          ...initialValues,
          phoneCode: initialValues.phoneCode || '',
          phoneNumber: initialValues.phoneNumber || '',
          role: initialValues?.role || '',
          isActive: initialValues?.isActive ?? true,
          isAgent: initialValues?.isAgent ?? false,
          agent: {
            profilePicture: initialValues?.agent?.profilePicture ?? '',
            idProofUrls: initialValues?.agent?.idProofUrls ?? [],
            idFullName: initialValues?.agent?.idFullName ?? '',
            residentialAddress: initialValues?.agent?.residentialAddress ?? '',
            relativePhoneNumber: initialValues?.agent?.relativePhoneNumber ?? '',
            areaOperations: initialValues?.agent?.areaOperations ?? [{ lat: 0, long: 0 }],
            isActive: initialValues?.agent?.isActive ?? true,
          },
        });
      }
    } else {
      // reset when closed so next open is fresh
      form.reset();
      setProfilePreview(null);
      setIdProofPreviews([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValues]);

  // watch for profile picture changes
  useEffect(() => {
    const pic = form.values.agent?.profilePicture;

    if (pic instanceof File) {
      const url = URL.createObjectURL(pic);
      setProfilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof pic === 'string') {
      setProfilePreview(pic);
    } else {
      setProfilePreview(null);
    }
  }, [form.values.agent?.profilePicture]);

  // watch for ID proof changes
  useEffect(() => {
    const files = form.values.agent?.idProofUrls ?? [];

    // Separate existing URLs (string) and new File objects
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

  const title = mode === 'add' ? 'Add New User' : 'Edit User';
  const submitLabel = mode === 'add' ? 'Submit' : 'Save Changes';

  const addAreaOperation = () => {
    form.insertListItem('agent.areaOperations', { lat: 0, long: 0 });
  };

  const removeAreaOperation = (index: number) => {
    form.removeListItem('agent.areaOperations', index);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
      <form
        onSubmit={form.onSubmit(async (values) => {
          const allIdProofs = form.values.agent?.idProofUrls ?? [];

          // Separate existing URLs (strings) and new files (File objects)
          const keepUrls = allIdProofs.filter((item) => typeof item === 'string') as string[];
          const newFiles = allIdProofs.filter((item) => item instanceof File) as File[];

          const cleanedKeepIdProofUrls = await Promise.all(
            keepUrls
              .filter((url) => !removedProofUrls.includes(url))
              .map(async (imageUrl) => {
                try {
                  const url = new URL(imageUrl);
                  const pathname = url.pathname;

                  // Match after '/object/sign/agents/' or '/object/public/agents/'
                  const match = pathname.match(/\/object\/(?:sign|public)\/agents\/(.+)$/);
                  const filename = match ? decodeURIComponent(match[1]) : imageUrl;

                  // ✅ Strip out the "agents/" folder prefix if accidentally included
                  const cleanFilename = filename.replace(/^agents\//, '');

                  return cleanFilename;
                } catch {
                  // Fallback if it's not a valid URL
                  const cleanFilename = imageUrl.replace(/^agents\//, '');
                  return cleanFilename;
                }
              })
          );

          const cleanedRemoveIdProofUrls = await Promise.all(
            removedProofUrls.map(async (imageUrl) => {
              try {
                const url = new URL(imageUrl);
                const pathname = url.pathname;

                // Match after '/object/sign/agents/' or '/object/public/agents/'
                const match = pathname.match(/\/object\/(?:sign|public)\/agents\/(.+)$/);
                const filename = match ? decodeURIComponent(match[1]) : imageUrl;

                // ✅ Strip out the "agents/" folder prefix if accidentally included
                const cleanFilename = filename.replace(/^agents\//, '');

                return cleanFilename;
              } catch {
                // Fallback if it's not a valid URL
                const cleanFilename = imageUrl.replace(/^agents\//, '');
                return cleanFilename;
              }
            })
          );

          const payload: UserFormValues = {
            ...values,
            agent: {
              ...values.agent,
              idProofUrls: newFiles, // only send new files here
              keepIdProofUrls: cleanedKeepIdProofUrls,
              removeIdProofUrls: cleanedRemoveIdProofUrls,
            },
          };

          onSubmit(payload);
          onClose();
        })}
      >
        <Stack>
          <Grid gutter="lg">
            {/* Image */}
            <Grid.Col span={{ base: 12, sm: 3 }}>
              {initialValues?.profilePicUrl ? (
                <Image src={initialValues.profilePicUrl} alt={initialValues.email} radius="sm" />
              ) : (
                <Paper
                  withBorder
                  radius="sm"
                  h={104}
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
              </Grid>
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

            <Grid.Col span={6}>
              {form.values.isAgent ? (
                <Grid grow>
                  <Grid.Col span={1}>
                    <TextInput
                      label="Phone Code"
                      placeholder="Enter phone code"
                      inputMode="tel"
                      required
                      {...form.getInputProps('phoneCode')}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      inputMode="tel"
                      required
                      {...form.getInputProps('phoneNumber')}
                    />
                  </Grid.Col>
                </Grid>
              ) : (
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Phone Number
                  </Text>
                  <Text size="sm" fw={600}>
                    {initialValues?.phoneCode || '-'}
                    {initialValues?.phoneNumber || '-'}
                  </Text>
                </Stack>
              )}
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Created At
                </Text>
                <Text size="sm" fw={600}>
                  {initialValues?.createdAt || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Email
                </Text>
                <Text size="sm" fw={600}>
                  {initialValues?.email || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Updated At
                </Text>
                <Text size="sm" fw={600}>
                  {initialValues?.updatedAt || '-'}
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>

          <Select
            label="Role"
            placeholder="Select role"
            data={['user', 'admin', 'other']}
            {...form.getInputProps('role')}
            required
          />

          {/* Status */}
          <Group>
            <Switch
              label="IsActive"
              checked={form.values.isActive}
              onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
            />
            <Switch
              label="IsAgent"
              checked={form.values.isAgent}
              onChange={(e) => form.setFieldValue('isAgent', e.currentTarget.checked)}
            />
          </Group>

          {/* Conditional Agent Data Section */}
          {form.values.isAgent && (
            <Stack gap="sm" mt="md" p="md" style={{ border: '1px solid #eee', borderRadius: 8 }}>
              <Text fw={600}>Agent Information</Text>

              {/* Profile Picture Upload */}
              <Stack gap={4}>
                <Group gap={4}>
                  <Text fw={500} size="sm">
                    Profile Picture
                  </Text>
                </Group>

                {(profilePreview ||
                  (typeof form.values.agent?.profilePicture === 'string' &&
                    form.values.agent.profilePicture)) && (
                  <Image
                    src={profilePreview || (form.values.agent?.profilePicture as string)}
                    alt="Profile Picture"
                    radius="md"
                    w={200}
                    fit="contain"
                  />
                )}

                <FileButton
                  onChange={(file) => {
                    if (file) {
                      form.setFieldValue('agent.profilePicture', file);
                    }
                  }}
                  accept="image/*"
                >
                  {(props) => (
                    <Button {...props} variant="light" w={200}>
                      {profilePreview || form.values.agent?.profilePicture
                        ? 'Change Image'
                        : 'Upload Image'}
                    </Button>
                  )}
                </FileButton>

                {form.values.agent?.profilePicture instanceof File && (
                  <Text size="xs" c="dimmed">
                    {form.values.agent.profilePicture.name}
                  </Text>
                )}
              </Stack>

              {/* ID Proof Upload */}
              <Stack gap={4}>
                <Group gap={4}>
                  <Text fw={500} size="sm">
                    ID Proof Documents
                  </Text>
                </Group>

                <Group>
                  {idProofPreviews.map((src, idx) => (
                    <Stack key={idx} align="center" gap={2}>
                      <Image
                        src={src}
                        alt={`ID Proof ${idx + 1}`}
                        w={120}
                        h={80}
                        fit="cover"
                        radius="sm"
                      />
                      <Button
                        leftSection={<IconTrash size={14} />}
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => {
                          const current = form.values.agent?.idProofUrls ?? [];
                          const target = current[idx];

                          if (typeof target === 'string') {
                            // mark old file for deletion
                            setRemovedProofUrls((prev) => [...prev, target]);
                            form.setFieldValue(
                              'agent.idProofUrls',
                              current.filter((_, i) => i !== idx)
                            );
                          } else if (target instanceof File) {
                            // just remove locally if it's a new file
                            form.setFieldValue(
                              'agent.idProofUrls',
                              current.filter((_, i) => i !== idx)
                            );
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  ))}
                </Group>

                <FileButton
                  onChange={(files) => {
                    if (files && files.length > 0) {
                      const newList = [...(form.values.agent?.idProofUrls ?? []), ...files];
                      form.setFieldValue('agent.idProofUrls', newList);
                    }
                  }}
                  accept="image/*"
                  multiple
                >
                  {(props) => (
                    <Button {...props} variant="light" w={200}>
                      Add ID Proofs
                    </Button>
                  )}
                </FileButton>

                {form.values.agent?.idProofUrls && form.values.agent.idProofUrls.length > 0 && (
                  <Text size="xs" c="dimmed">
                    {form.values.agent?.idProofUrls?.length} file(s) selected
                  </Text>
                )}
              </Stack>

              <TextInput
                label="Full Name (ID)"
                placeholder="Enter full name as on ID card"
                required
                {...form.getInputProps('agent.idFullName')}
              />

              <Textarea
                label="Residential Address"
                placeholder="Enter full address"
                autosize
                minRows={2}
                required
                {...form.getInputProps('agent.residentialAddress')}
              />

              <TextInput
                label="Relative Phone Number"
                placeholder="Enter relative phone number"
                inputMode="tel"
                required
                {...form.getInputProps('agent.relativePhoneNumber')}
              />

              <Group justify="space-between" mt="xs">
                <Text fw={500}>Operational Areas</Text>
                <Button variant="light" size="xs" onClick={addAreaOperation}>
                  Add Area
                </Button>
              </Group>

              {form.values.agent?.areaOperations?.map((_, idx) => (
                <Group key={idx} align="flex-end">
                  <NumberInput
                    label="Latitude"
                    maxLength={12}
                    required
                    {...form.getInputProps(`agent.areaOperations.${idx}.lat`)}
                  />
                  <NumberInput
                    label="Longitude"
                    maxLength={12}
                    required
                    {...form.getInputProps(`agent.areaOperations.${idx}.long`)}
                  />
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={() => removeAreaOperation(idx)}
                    size="xs"
                  >
                    Remove
                  </Button>
                </Group>
              ))}

              <Switch
                label={`Agent ${form.values.agent?.isActive ? 'Active' : 'Inactive'}`}
                checked={form.values.agent?.isActive}
                onChange={(e) => form.setFieldValue('agent.isActive', e.currentTarget.checked)}
              />
            </Stack>
          )}

          {/* Actions */}
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
