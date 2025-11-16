'use client';

import { useEffect } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

// Enum values should match backend's VoucherDiscountType
const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed Amount' },
];

export interface VoucherFormValues {
  code: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  quota?: number;
  appliesToAll?: boolean;
  userId?: string;
  expiresAt?: string | null;
  isVisible?: boolean;
  isActive?: boolean;
}

interface VoucherFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: Partial<VoucherFormValues>;
  onClose: () => void;
  onSubmit: (values: VoucherFormValues) => void;
}

export function VoucherFormModal({
  opened,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: VoucherFormModalProps) {
  const form = useForm<VoucherFormValues>({
    initialValues: {
      code: '',
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 1,
      quota: undefined,
      appliesToAll: false,
      userId: '',
      expiresAt: null,
      isVisible: true,
      isActive: true,
      ...initialValues,
    },
    validate: {
      code: (v) => (!v.trim() ? 'Code is required' : null),
      title: (v) => (!v.trim() ? 'Title is required' : null),
      discountValue: (v) => (v < 1 ? 'Discount value must be at least 1' : null),
      quota: (v) => (v !== undefined && v < 1 ? 'Quota must be at least 1' : null),
    },
  });

  useEffect(() => {
    if (opened && initialValues) {
      form.setValues({
        code: initialValues.code || '',
        title: initialValues.title || '',
        description: initialValues.description || '',
        discountType: initialValues.discountType || 'PERCENTAGE',
        discountValue: initialValues.discountValue || 1,
        quota: initialValues.quota || undefined,
        appliesToAll: initialValues.appliesToAll || false,
        userId: initialValues.userId || '',
        expiresAt: initialValues.expiresAt || null,
        isVisible: initialValues.isVisible,
        isActive: initialValues.isActive,
      });
    } else if (opened && mode === 'add') {
      form.reset();
    }
  }, [opened, initialValues, mode]);

  const handleSubmit = (values: VoucherFormValues) => {
    onSubmit({
      ...values,
      userId: values.appliesToAll ? '' : values.userId,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'add' ? 'Create Voucher' : 'Edit Voucher'}
      size="md"
      radius="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* Code */}
        <TextInput
          label="Voucher Code"
          placeholder="e.g., WELCOME50"
          required
          {...form.getInputProps('code')}
          mb="md"
        />

        {/* Title */}
        <TextInput
          label="Title"
          placeholder="Enter voucher title"
          required
          {...form.getInputProps('title')}
          mb="md"
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe what this voucher does"
          autosize
          minRows={3}
          {...form.getInputProps('description')}
          mb="md"
        />

        {/* Discount Type */}
        <Select
          label="Discount Type"
          data={DISCOUNT_TYPES}
          required
          {...form.getInputProps('discountType')}
          mb="md"
        />

        {/* Discount Value */}
        <NumberInput
          label="Discount Value"
          placeholder="Enter discount value"
          required
          min={1}
          {...form.getInputProps('discountValue')}
          mb="md"
        />

        {/* Quota */}
        <NumberInput
          label="Quota (optional)"
          placeholder="Total usage limit"
          min={1}
          {...form.getInputProps('quota')}
          mb="md"
        />

        {/* Applies to All */}
        <Switch
          label="Applies to All Users"
          {...form.getInputProps('appliesToAll', { type: 'checkbox' })}
          mb="md"
        />

        {/* User ID (only if not appliesToAll) */}
        {!form.values.appliesToAll && (
          <TextInput
            label="User ID (optional)"
            placeholder="Assign to specific user"
            required
            {...form.getInputProps('userId')}
            mb="md"
          />
        )}

        {/* Expires At */}
        <DateInput
          label="Expiration Date"
          valueFormat="YYYY-MM-DD"
          clearable
          required={!form.values.quota}
          {...form.getInputProps('expiresAt')}
          mb="md"
        />

        <Group gap={16}>
          {/* Visiblilty */}
          <Switch
            label="Visiblity"
            {...form.getInputProps('isVisible', { type: 'checkbox' })}
            mb="lg"
          />

          {/* Active */}
          <Switch
            label="Active"
            {...form.getInputProps('isActive', { type: 'checkbox' })}
            mb="lg"
          />
        </Group>

        <Group justify="end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="blue">
            {mode === 'add' ? 'Create' : 'Save Changes'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
