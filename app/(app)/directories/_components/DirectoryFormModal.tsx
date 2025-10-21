import { useEffect, useState } from 'react';
import {
  Button,
  FileButton,
  Group,
  Image,
  Modal,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export type DirectoryFormValues = {
  image?: File | null;
  imageUrl?: string; // 👈 new: for existing image path/url
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
};

interface DirectoryFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: DirectoryFormValues;
  onClose: () => void;
  onSubmit: (values: DirectoryFormValues) => void;
}

export function DirectoryFormModal({
  opened,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: DirectoryFormModalProps) {
  const form = useForm<DirectoryFormValues>({
    initialValues: {
      image: null,
      imageUrl: '',
      name: '',
      slug: '',
      isActive: true,
      ...initialValues, // merge when editing
      description: initialValues?.description || '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name is too short' : null),
      slug: (value) => (value.trim().length < 2 ? 'Slug is too short' : null),
    },
  });

  // reset form when modal changes
  useEffect(() => {
    form.setValues({
      image: null,
      imageUrl: initialValues?.imageUrl || '',
      name: initialValues?.name || '',
      slug: initialValues?.slug || '',
      isActive: initialValues?.isActive ?? true,
      description: initialValues?.description || '',
    });
  }, [opened, mode, initialValues]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update preview when user selects new file
  useEffect(() => {
    if (form.values.image instanceof File) {
      const objectUrl = URL.createObjectURL(form.values.image);
      setPreviewUrl(objectUrl);

      // cleanup
      return () => URL.revokeObjectURL(objectUrl);
      // eslint-disable-next-line no-else-return
    } else {
      setPreviewUrl(null);
    }
  }, [form.values.image]);

  const title = mode === 'add' ? 'Add New Directory' : 'Edit Directory';
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
          {/* Image Upload / Preview */}
          {(previewUrl || form.values.imageUrl) && (
            <Image
              src={previewUrl || form.values.imageUrl}
              alt="Directory Image"
              radius="md"
              w={200}
              fit="contain"
            />
          )}

          <FileButton onChange={(file) => form.setFieldValue('image', file)} accept="image/*">
            {(props) => (
              <Button {...props} variant="light" w={200}>
                {previewUrl || form.values.imageUrl ? 'Change Image' : 'Upload Image'}
              </Button>
            )}
          </FileButton>
          {form.values.image && (
            <Text size="xs" c="dimmed">
              {form.values.image.name}
            </Text>
          )}

          {/* Name */}
          <TextInput
            label="Name"
            placeholder="Enter directory name"
            required
            {...form.getInputProps('name')}
          />

          {/* Slug */}
          <TextInput
            label="Slug"
            placeholder="Enter slug name"
            required
            value={form.values.slug}
            onChange={(e) => {
              const sanitized = e.currentTarget.value.replace(/\s+/g, '-');
              form.setFieldValue('slug', sanitized.toLowerCase());
            }}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Enter description"
            {...form.getInputProps('description')}
          />

          {/* Status */}
          <Switch
            label="IsActive"
            checked={form.values.isActive}
            onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
          />

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
