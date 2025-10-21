'use client';

import { useEffect } from 'react';
import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

/* ---------------------- Types ---------------------- */
export interface PlaceFormValues {
  name: string;
  desc?: string;
}

interface PlaceFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: PlaceFormValues;
  onClose: () => void;
  onSubmit: (values: PlaceFormValues) => void;
}

/* ---------------------- Component ---------------------- */
export function PlaceFormModal({
  opened,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: PlaceFormModalProps) {
  const form = useForm<PlaceFormValues>({
    initialValues: {
      name: '',
      desc: '',
      ...((initialValues as any) || {}),
    },
    validate: {
      name: (v) => (v?.trim().length ? null : 'Name is required'),
    },
  });

  // reset form when modal changes
  useEffect(() => {
    form.setValues({
      name: initialValues?.name || '',
      desc: initialValues?.desc || '',
    });
  }, [opened, mode, initialValues]);

  /* ---------------------- Render ---------------------- */
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Place' : 'Edit Place'}
      centered
      size="md"
      radius="md"
    >
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values);
          onClose();
        })}
      >
        {/* Name */}
        <TextInput
          label="Name"
          placeholder="Enter place name"
          required
          {...form.getInputProps('name')}
          mb="md"
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Enter description"
          autosize
          minRows={3}
          {...form.getInputProps('desc')}
          mb="lg"
        />

        {/* Buttons */}
        <Group justify="end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="blue">
            {mode === 'add' ? 'Submit' : 'Save'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
