'use client';

import { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
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
import { ProcedureDropdownResponse, ProcedureFormValues } from '@/services/procedureService';
import StepList from './StepList';

type ProcedureModalProps = {
  opened: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialValues?: Partial<ProcedureFormValues>;
  dropdownData: ProcedureDropdownResponse;
  onSubmit: (values: ProcedureFormValues) => void | Promise<void>;
};

export default function ProcedureModal({
  opened,
  onClose,
  mode,
  initialValues,
  dropdownData,
  onSubmit,
}: ProcedureModalProps) {
  const form = useForm<ProcedureFormValues>({
    initialValues: {
      directoryId: '',
      name: '',
      slug: '',
      isActive: true,
      isAssistant: false,
      requirements: [],
      documents: [],
      places: [],
      steps: [],
      ...initialValues,
      description: initialValues?.description || '',
    },
  });

  // Options state (includes programmatically created options)
  const [options, setOptions] = useState<string[]>([]);

  // When modal opens for edit, set values from initialValues.
  // When closed, reset to initial initialValues (the one passed to useForm).
  useEffect(() => {
    if (opened) {
      if (initialValues) {
        // merge carefully to avoid undefined
        form.setValues({
          ...form.values,
          ...initialValues,
          description: initialValues?.description || '',
          requirements:
            initialValues.requirements?.map((item) => ({
              description: item.description,
            })) ?? form.values.requirements,
          documents:
            initialValues.documents?.map((item) => ({
              documentId: item.documentId,
              amount: item.amount,
              required: item.required,
              directoryId: item.directoryId,
            })) ?? form.values.documents,
          places:
            initialValues.places?.map((item) => ({
              placeId: item.placeId,
            })) ?? form.values.places,
          steps: initialValues.steps
            ? initialValues.steps.map((item, i) => ({
                id:
                  item.id ||
                  (globalThis.crypto && (crypto as any).randomUUID
                    ? (crypto as any).randomUUID()
                    : `step-${i}-${Date.now()}`),
                order: item.order ?? i + 1,
                description: item.description ?? '',
                group: item.group ?? '',
                linkURL: item.linkURL ?? '',
                imageUrl: item.imageUrl ?? '',
                image: item.image ?? null,
              }))
            : form.values.steps,
        } as ProcedureFormValues);
        const defaultOptions = initialValues.steps?.map((item) => item.group) || [];
        const dropdowDefault = dropdownData.stepGroup?.map((item) => item.group) || [];
        setOptions(Array.from(new Set([...defaultOptions, ...dropdowDefault])));
      }
    } else {
      // reset when closed so next open is fresh
      form.reset();
    }
  }, [opened, initialValues]);

  // helpers to manipulate lists (documents / places / steps)
  const addRequirement = () =>
    form.setValues({
      ...form.values,
      requirements: [...form.values.requirements, { description: '' }],
    });

  const removeRequirement = (index: number) => {
    const requirements = [...form.values.requirements];
    requirements.splice(index, 1);
    form.setValues({ ...form.values, requirements });
  };

  const addDocument = () =>
    form.setValues({
      ...form.values,
      documents: [...form.values.documents, { documentId: '', amount: 1, required: false }],
    });

  const removeDocument = (index: number) => {
    const docs = [...form.values.documents];
    docs.splice(index, 1);
    form.setValues({ ...form.values, documents: docs });
  };

  const addPlace = () =>
    form.setValues({
      ...form.values,
      places: [...form.values.places, { placeId: '' }],
    });

  const removePlace = (index: number) => {
    const places = [...form.values.places];
    places.splice(index, 1);
    form.setValues({ ...form.values, places });
  };

  // const addStep = () =>
  //   form.setValues({
  //     ...form.values,
  //     steps: [
  //       ...form.values.steps,
  //       {
  //         order: form.values.steps.length + 1,
  //         description: '',
  //         group: '',
  //         linkURL: '',
  //         imageUrl: '',
  //       },
  //     ],
  //   });

  // const removeStep = (index: number) => {
  //   const steps = [...form.values.steps];
  //   steps.splice(index, 1);
  //   // re-number
  //   const renumbered = steps.map((s, i) => ({ ...s, number: i + 1 }));
  //   form.setValues({ ...form.values, steps: renumbered });
  // };

  const handleSubmit = async (values: ProcedureFormValues) => {
    await onSubmit(values);
    // optionally close modal after successful submit
    onClose(); // caller may choose to close in their onSubmit handler
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Procedure' : 'Edit Procedure'}
      size="lg"
      withCloseButton
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Directory */}
          <Select
            label="Directory"
            placeholder="Select directory"
            disabled
            data={dropdownData.directory.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            {...form.getInputProps('directoryId')}
            required
          />

          {/* Name */}
          <TextInput
            label="Name"
            placeholder="Enter procedure name"
            {...form.getInputProps('name')}
            required
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

          <Group grow>
            <Group gap="xs" align="center">
              <Switch {...form.getInputProps('isActive', { type: 'checkbox' })} />
              <Text size="sm">Status</Text>
            </Group>

            <Group gap="xs" align="center">
              <Switch {...form.getInputProps('isAssistant', { type: 'checkbox' })} />
              <Text size="sm">Is Assistant</Text>
            </Group>
          </Group>

          {form.values.isAssistant && (
            <>
              <NumberInput
                label="Duration (in days)"
                min={1}
                required={form.values.isAssistant}
                {...form.getInputProps('duration')}
              />
              <NumberInput
                label="Cost of Service"
                placeholder="Enter cost of service"
                thousandSeparator="."
                decimalSeparator=","
                prefix="Rp"
                required={form.values.isAssistant}
                {...form.getInputProps('cost')}
              />
            </>
          )}

          {/* Requirements */}
          <Divider label="Requirements" />
          <Stack gap="sm">
            {form.values.requirements.length === 0 && (
              <Text size="sm" c="dimmed">
                No requirement yet. Add one below.
              </Text>
            )}

            {form.values.requirements.map((_, idx) => (
              <Paper key={idx} p="sm" radius="md" withBorder>
                <Group align="center" wrap="nowrap">
                  <Textarea
                    label="Requirement Description"
                    placeholder="Enter requirement description"
                    {...form.getInputProps(`requirements.${idx}.description`)}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeRequirement(idx)}
                    aria-label="Delete place"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}

            <Button variant="light" onClick={addRequirement}>
              + Add New Requirement
            </Button>
          </Stack>

          {/* Documents */}
          <Divider label="Documents" />
          <Stack gap="sm">
            {form.values.documents.length === 0 && (
              <Text size="sm" c="dimmed">
                No documents yet. Add one below.
              </Text>
            )}

            {form.values.documents.map((_, idx) => (
              <Paper key={idx} p="sm" radius="md" withBorder>
                <Group align="center" wrap="nowrap">
                  <Stack>
                    <Group align="center">
                      <Group align="end" flex={1} wrap="nowrap">
                        <Box style={{ flex: 1, minWidth: 100 }}>
                          <Select
                            searchable
                            label="Document Name"
                            placeholder="Select document"
                            data={dropdownData.documents.map((item) => ({
                              label: item.name,
                              value: item.id,
                            }))}
                            {...form.getInputProps(`documents.${idx}.documentId` as any)}
                            required
                            style={{ flex: 1 }}
                          />
                        </Box>

                        <Box style={{ flex: 1 }}>
                          <NumberInput
                            label="Document Amount"
                            min={1}
                            {...form.getInputProps(`documents.${idx}.amount` as any)}
                            required
                          />
                        </Box>
                      </Group>
                      <Box style={{ minWidth: 90 }}>
                        <Select
                          label="Directory Reference"
                          placeholder="Select directory"
                          data={dropdownData.directory.map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                          {...form.getInputProps(`documents.${idx}.directoryId` as any)}
                        />
                      </Box>
                    </Group>
                    <Group align="center">
                      <Box style={{ flex: 1, minWidth: 100 }}>
                        <Group align="center" gap="xs">
                          <Switch
                            {...form.getInputProps(`documents.${idx}.required` as any, {
                              type: 'checkbox',
                            })}
                          />
                          <Text size="sm">
                            {form.values.documents[idx].required ? 'Required' : 'Optional'}
                          </Text>
                        </Group>
                      </Box>
                    </Group>
                  </Stack>

                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeDocument(idx)}
                    aria-label="Delete document"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}

            <Button variant="light" onClick={addDocument}>
              + Add New Document
            </Button>
          </Stack>

          {/* Places */}
          <Divider label="Places" />
          <Stack gap="sm">
            {form.values.places.length === 0 && (
              <Text size="sm" c="dimmed">
                No places yet. Add one below.
              </Text>
            )}

            {form.values.places.map((_, idx) => (
              <Paper key={idx} p="sm" radius="md" withBorder>
                <Group align="center" wrap="nowrap">
                  <Select
                    label="Place Name"
                    placeholder="Select place"
                    searchable
                    data={dropdownData.places.map((item) => ({ label: item.name, value: item.id }))}
                    {...form.getInputProps(`places.${idx}.placeId` as any)}
                    required
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removePlace(idx)}
                    aria-label="Delete place"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}

            <Button variant="light" onClick={addPlace}>
              + Add New Place
            </Button>
          </Stack>

          {/* Steps */}
          <Divider label="Steps" />
          <StepList form={form} options={options} setOptions={setOptions} />
        </Stack>

        {/* Footer */}
        <Group justify="right" mt="lg">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === 'add' ? 'Submit' : 'Save'}</Button>
        </Group>
      </form>
    </Modal>
  );
}
