import { useEffect, useState } from 'react';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { RichTextEditor } from '@mantine/tiptap';

export type ArticleFormValues = {
  slug: string;
  title: string;
  content: string;
  articleDate: string;
  writer: string;
  image?: File | null;
  imageUrl?: string;
  imageDesc?: string;
  sourceURL?: string;
  isActive: boolean;
};

interface ArticleFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: ArticleFormValues;
  onClose: () => void;
  onSubmit: (values: ArticleFormValues) => void;
}

export function ArticleFormModal({
  opened,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: ArticleFormModalProps) {
  // Mantine form
  const form = useForm<ArticleFormValues>({
    initialValues: {
      slug: '',
      title: '',
      content: '',
      articleDate: '',
      writer: '',
      image: null,
      imageUrl: '',
      imageDesc: '',
      sourceURL: '',
      isActive: true,
      ...initialValues,
    },
    validate: {
      title: (value) => (value.trim().length < 2 ? 'Title is too short' : null),
      slug: (value) => (value.trim().length < 2 ? 'Slug is too short' : null),
      content: (value) =>
        !value || value.trim().replace(/<[^>]*>/g, '').length === 0 ? 'Content is required' : null,
    },
  });

  // Tiptap editor setup
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        link: false,
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
      }),
      Link,
      Superscript,
      Subscript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Enter article content' }),
    ],
    content: form.values.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      form.setFieldValue('content', html);
    },
  });

  // Reset form when modal changes
  useEffect(() => {
    // Reset form values
    form.setValues({
      slug: initialValues?.slug || '',
      title: initialValues?.title || '',
      content: initialValues?.content || '',
      articleDate: initialValues?.articleDate || '',
      writer: initialValues?.writer || '',
      image: null,
      imageUrl: initialValues?.imageUrl || '',
      imageDesc: initialValues?.imageDesc || '',
      sourceURL: initialValues?.sourceURL || '',
      isActive: initialValues?.isActive ?? true,
    });

    // Reset TipTap content AFTER editor is ready
    if (editor) {
      if (mode === 'edit' && initialValues?.content) {
        editor.commands.setContent(initialValues.content);
      } else {
        editor.commands.clearContent(); // 👈 always clear in "add" mode
      }
    }
  }, [opened, mode, initialValues, editor]);

  // Image preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (form.values.image instanceof File) {
      const objectUrl = URL.createObjectURL(form.values.image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
      // eslint-disable-next-line no-else-return
    } else {
      setPreviewUrl(null);
    }
  }, [form.values.image]);

  const title = mode === 'add' ? 'Add New Article' : 'Edit Article';
  const submitLabel = mode === 'add' ? 'Submit' : 'Save Changes';

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
      <form
        onSubmit={form.onSubmit((values) => {
          const payload = {
            ...values,
            articleDate: values.articleDate ? new Date(values.articleDate).toISOString() : '',
          };
          onSubmit(payload);
          onClose();
        })}
      >
        <Stack>
          {/* Title */}
          <TextInput
            label="Title"
            placeholder="Enter article title"
            required
            {...form.getInputProps('title')}
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

          {/* Content */}
          <Stack gap={4}>
            <Group gap={4}>
              <Text fw={500} size="sm">
                Content
              </Text>
              <Text c="red">*</Text>
            </Group>
            <RichTextEditor editor={editor}>
              <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                  <RichTextEditor.Highlight />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.AlignLeft />
                  <RichTextEditor.AlignCenter />
                  <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Undo />
                  <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>

            {/* Error Message */}
            {form.errors.content && (
              <Text size="xs" c="red">
                {form.errors.content}
              </Text>
            )}
          </Stack>

          {/* Article Date */}
          <DateInput
            label="Article Date"
            placeholder="Select article date"
            required
            {...form.getInputProps('articleDate')}
          />

          {/* Writer */}
          <TextInput
            label="Writer"
            placeholder="Enter article writer"
            required
            {...form.getInputProps('writer')}
          />

          {/* Image Upload / Preview */}
          <Stack gap={0}>
            <Group gap={4}>
              <Text fw={500} size="sm">
                Article Image
              </Text>
            </Group>
            {(previewUrl || form.values.imageUrl) && (
              <Image
                src={previewUrl || form.values.imageUrl}
                alt="Article Image"
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
          </Stack>

          {/* Image Description */}
          <Textarea
            label="Image Description"
            placeholder="Enter image description"
            {...form.getInputProps('imageDesc')}
          />

          {/* Source URL */}
          <TextInput
            label="Source URL"
            placeholder="Enter source URL"
            {...form.getInputProps('sourceURL')}
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
