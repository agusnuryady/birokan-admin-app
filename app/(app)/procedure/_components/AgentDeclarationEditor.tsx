import { IconTrash } from '@tabler/icons-react';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ActionIcon, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { RichTextEditor } from '@mantine/tiptap';
import { ProcedureDeclarationInput, ProcedureFormValues } from '@/services/procedureService';

type AgentDeclarationEditorProps = {
  idx: number;
  agentDeclarations: ProcedureDeclarationInput;
  form: UseFormReturnType<
    ProcedureFormValues,
    (values: ProcedureFormValues) => ProcedureFormValues
  >;
  removeDeclaration: (idx: number) => void;
};

export function AgentDeclarationEditor({
  idx,
  agentDeclarations,
  form,
  removeDeclaration,
}: AgentDeclarationEditorProps) {
  const debouncedSetContent = useDebouncedCallback(
    (html: string) => {
      form.setFieldValue(`agentDeclarations.${idx}.content`, html);
    },
    300 // ms
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
          bulletList: { HTMLAttributes: { class: 'list-disc pl-4' } },
          orderedList: { HTMLAttributes: { class: 'list-decimal pl-4' } },
        }),
        Link,
        Superscript,
        Subscript,
        Highlight,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: 'Enter declaration content' }),
      ],
      content: agentDeclarations.content || '',
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        debouncedSetContent(editor.getHTML());
      },
    },
    [idx]
  );

  if (!editor) {
    return null;
  }

  return (
    <Paper p="sm" radius="md" withBorder>
      <Group align="start" wrap="nowrap">
        <Stack style={{ flex: 1 }} gap="xs">
          <TextInput
            label="Agent Declaration Title"
            placeholder="Enter declaration title"
            {...form.getInputProps(`agentDeclarations.${idx}.title`)}
            required
          />

          <TextInput
            label="Bold Words"
            placeholder="Enter bold words"
            {...form.getInputProps(`agentDeclarations.${idx}.boldText`)}
          />

          <Stack gap={4}>
            <Group gap={4}>
              <Text fw={500} size="sm">
                Content
              </Text>
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
          </Stack>
        </Stack>

        <ActionIcon
          color="red"
          variant="light"
          onClick={() => removeDeclaration(idx)}
          aria-label="Delete declaration"
          mt={4}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
