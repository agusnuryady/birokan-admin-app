import { useEffect } from 'react';
import {
  Button,
  Grid,
  Group,
  Image,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export type AccountFormValues = {
  id?: string;
  profilePicId?: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  idCardNumber?: string;
  role?: string;
  isActive?: boolean;
  isAgent?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface AccountFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: AccountFormValues;
  onClose: () => void;
  onSubmit: (values: AccountFormValues) => void;
}

export function AccountFormModal({
  opened,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: AccountFormModalProps) {
  const form = useForm<AccountFormValues>({
    initialValues: {
      role: '',
      isActive: true,
      isAgent: true,
      ...initialValues, // merge when editing
    },
    validate: {
      role: (value) =>
        !['admin', 'user', 'other'].includes(value || '') ? 'Role type not valid' : null,
    },
  });

  // reset form when modal changes
  useEffect(() => {
    form.setValues({
      role: initialValues?.role || '',
      isActive: initialValues?.isActive ?? true,
      isAgent: initialValues?.isAgent ?? false,
    });
  }, [opened, mode, initialValues]);

  const title = mode === 'add' ? 'Add New User' : 'Edit User';
  const submitLabel = mode === 'add' ? 'Submit' : 'Save Changes';

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values);
          onClose();
        })}
      >
        <Stack>
          <Grid gutter="lg">
            {/* Image */}
            <Grid.Col span={{ base: 12, sm: 3 }}>
              {initialValues?.profilePicId ? (
                <Image src={initialValues.profilePicId} alt={initialValues.email} radius="sm" />
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
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Phone Number
                </Text>
                <Text size="sm" fw={600}>
                  {initialValues?.phoneNumber || '-'}
                </Text>
              </Stack>
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
