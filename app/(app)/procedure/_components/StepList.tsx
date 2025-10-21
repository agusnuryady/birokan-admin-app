'use client';

import React from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Button,
  Divider,
  FileButton,
  Group,
  Image,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import StepGroupSelect from './StepGroupSelect';

// Type for step item inside ProcedureFormValues
type StepItem = {
  id: string;
  order: number;
  description?: string;
  group?: string;
  linkURL?: string;
  image?: File | null;
  imageUrl?: string;
};

type Props = {
  form: UseFormReturnType<any, (values: any) => any>; // keep generic to integrate with your mantine form
  options: string[];
  setOptions: (opts: string[]) => void;
};

function SortableStep({
  id,
  idx,
  step,
  form,
  options,
  setOptions,
  onRemove,
}: {
  id: string;
  idx: number;
  step: StepItem;
  form: UseFormReturnType<any, (values: any) => any>;
  options: string[];
  setOptions: (opts: string[]) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition,
  };

  // access form fields via index
  return (
    <Paper ref={setNodeRef} style={style} p="sm" radius="md" withBorder>
      <Group align="start" wrap="nowrap">
        <ActionIcon variant="subtle" {...attributes} {...listeners} mt={28} aria-label="drag">
          <IconGripVertical size={16} />
        </ActionIcon>

        <Stack style={{ flex: 1 }}>
          <Group align="end">
            <NumberInput label="Step Number" value={idx + 1} readOnly />

            <StepGroupSelect
              value={step.group || ''}
              onChange={(val) => form.setFieldValue(`steps.${idx}.group`, val)}
              options={options}
              setOptions={setOptions}
            />
          </Group>

          <Textarea
            label="Step Description"
            placeholder="Enter step description"
            required
            {...(form.getInputProps(`steps.${idx}.description` as any) as any)}
          />

          <Divider label="Optional" />

          <Group align="end" style={{ gap: 12 }}>
            <Stack style={{ flex: 1 }}>
              {step.imageUrl && (
                <Image
                  src={step.imageUrl}
                  alt={`step-${idx}-image`}
                  radius="md"
                  width={200}
                  fit="contain"
                />
              )}
              {step.image && (
                <Text size="xs" c="dimmed">
                  {step.image.name}
                </Text>
              )}

              <FileButton
                onChange={(file) => {
                  if (file instanceof File) {
                    const objectUrl = URL.createObjectURL(file);
                    form.setFieldValue(`steps.${idx}.image`, file);
                    form.setFieldValue(`steps.${idx}.imageUrl`, objectUrl);
                  }
                }}
                accept="image/*"
              >
                {(props) => (
                  <Button {...props} variant="light">
                    {step.imageUrl ? 'Change Image' : 'Upload Image'}
                  </Button>
                )}
              </FileButton>
            </Stack>

            <TextInput
              label="Link URL"
              placeholder="Enter link URL"
              {...(form.getInputProps(`steps.${idx}.linkURL` as any) as any)}
              style={{ flex: 1 }}
            />
          </Group>
        </Stack>

        <ActionIcon
          color="red"
          variant="light"
          onClick={() => onRemove(idx)}
          aria-label="Delete step"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

export default function StepList({ form, options, setOptions }: Props) {
  // ensure steps array exists
  const steps: StepItem[] = form.values.steps || [];

  // sensors: pointer for touch/desktop
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    if (active.id === over.id) {
      return;
    }

    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i + 1,
    }));
    form.setFieldValue('steps', reordered);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    form.setFieldValue('steps', updated);
  };

  const addStep = () => {
    const newStep: StepItem = {
      id:
        globalThis.crypto && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${Math.random()}`,
      order: steps.length + 1,
      description: '',
      group: '',
      linkURL: '',
      image: null,
      imageUrl: '',
    };
    form.setFieldValue('steps', [...steps, newStep]);
  };

  return (
    <Stack gap="sm">
      {steps.length === 0 && (
        <Text size="sm" c="dimmed">
          No steps yet. Add one below.
        </Text>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step, idx) => (
            <SortableStep
              key={step.id}
              id={step.id}
              idx={idx}
              step={step}
              form={form}
              options={options}
              setOptions={setOptions}
              onRemove={removeStep}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="light" onClick={addStep}>
        + Add New Step
      </Button>
    </Stack>
  );
}
