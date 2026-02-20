'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  FileButton,
  Group,
  Image,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  ProcedureDropdownResponse,
  ProcedureFormValues,
  QuestionType,
} from '@/services/procedureService';
import {
  buildFormulaExpression,
  calculateCostBreakdown,
  evaluateFormula,
} from '@/utils/procedure/helper';
import { CompleteOrderDeclarationEditor } from './CompleteOrderDeclarationEditor';
import { CustomCostBuilder } from './custom-cost/CustomCostBuilder';
import { DeclarationEditor } from './DeclarationEditor';
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
      costOptions: [],
      requirements: [],
      documents: [],
      places: [],
      steps: [],
      questions: [],
      declarations: [],
      completeForms: [],
      questionsValidation: [],
      agentDeclarations: [],
      costFormula: {
        tokens: [],
      },
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
          costOptions:
            initialValues.costOptions?.map((item) => ({
              cost: item.cost,
              title: item.title,
              desc: item.desc,
              minTime: item.minTime,
              maxTime: item.maxTime,
            })) ?? form.values.costOptions,
          requirements:
            initialValues.requirements?.map((item) => ({
              ...(item.id && { id: item.id }),
              description: item.description,
            })) ?? form.values.requirements,
          documents:
            initialValues.documents?.map((item) => ({
              ...(item.id && { id: item.id }),
              documentId: item.documentId,
              amount: item.amount,
              required: item.required,
              directoryId: item.directoryId,
            })) ?? form.values.documents,
          places:
            initialValues.places?.map((item) => ({
              ...(item.id && { id: item.id }),
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
          questions:
            initialValues.questions?.map((item) => ({
              ...(item.id && { id: item.id }),
              label: item.label,
              description: item.description,
              questionText: item.questionText,
              type: item.type,
              required: item.required,
              options: item.options,
              linkURL: item.linkURL ?? '',
              imageUrl: item.imageUrl ?? '',
            })) ?? form.values.questions,
          declarations:
            initialValues.declarations?.map((item) => ({
              ...(item.id && { id: item.id }),
              title: item.title,
              boldText: item.boldText,
              content: item.content,
            })) ?? form.values.declarations,
          completeForms:
            initialValues.completeForms?.map((item) => ({
              ...(item.id && { id: item.id }),
              title: item.title,
              boldText: item.boldText,
              content: item.content,
            })) ?? form.values.completeForms,
          costFormula: initialValues.costFormula ?? {
            tokens: [],
          },
        } as ProcedureFormValues);
        const defaultOptions = initialValues.steps?.map((item) => item.group) || [];
        const dropdowDefault = dropdownData.stepGroup?.map((item) => item.group) || [];
        setOptions(Array.from(new Set([...defaultOptions, ...dropdowDefault])));
      }
    } else {
      // reset when closed so next open is fresh
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValues]);

  // helpers to manipulate lists (documents / places / steps)
  const addCostOption = () =>
    form.setValues({
      ...form.values,
      costOptions: [
        ...form.values.costOptions,
        { cost: 50000, title: '', desc: '', minTime: 1, maxTime: 1 },
      ],
    });

  const removeCostOption = (index: number) => {
    const costOptions = [...form.values.costOptions];
    costOptions.splice(index, 1);
    form.setValues({ ...form.values, costOptions });
  };

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

  const addQuestion = () =>
    form.setValues({
      ...form.values,
      questions: [
        ...form.values.questions,
        { questionText: '', type: QuestionType.TEXT, required: true, description: '', options: [] },
      ],
    });

  const removeQuestion = (index: number) => {
    const questions = [...form.values.questions];
    questions.splice(index, 1);
    form.setValues({ ...form.values, questions });
  };

  const addDeclaration = () =>
    form.setValues({
      ...form.values,
      declarations: [
        ...form.values.declarations,
        { id: crypto.randomUUID(), title: '', boldText: '', content: '' },
      ],
    });

  const removeDeclaration = (index: number) => {
    const declarations = [...form.values.declarations];
    declarations.splice(index, 1);
    form.setValues({ ...form.values, declarations });
  };

  const addCompleteForm = () =>
    form.setValues({
      ...form.values,
      completeForms: [
        ...form.values.completeForms,
        { id: crypto.randomUUID(), title: '', boldText: '', content: '' },
      ],
    });

  const removeCompleteForm = (index: number) => {
    const completeForms = [...form.values.completeForms];
    completeForms.splice(index, 1);
    form.setValues({ ...form.values, completeForms });
  };

  const handleSubmit = async (values: ProcedureFormValues) => {
    await onSubmit(values);
    // optionally close modal after successful submit
    onClose(); // caller may choose to close in their onSubmit handler
  };

  const costBreakdown = useMemo(() => {
    return calculateCostBreakdown(form.values.costFormula?.tokens ?? []);
  }, [form.values.costFormula?.tokens]);

  const breakdownSubtotal = useMemo(() => {
    return costBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [costBreakdown]);

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
              {/* Cost Options */}
              <Divider label="Cost Options" />
              <Stack gap="sm">
                {(!form.values.costOptions || form.values.costOptions.length === 0) && (
                  <Text size="sm" c="dimmed">
                    No cost option yet. Add one below.
                  </Text>
                )}

                {form.values.costOptions.map((_, idx) => (
                  <Paper key={idx} p="sm" radius="md" withBorder>
                    <Group align="center" wrap="nowrap">
                      <Stack style={{ flex: 1 }}>
                        <NumberInput
                          label="Cost of Service"
                          placeholder="Enter cost of service"
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={4}
                          step={0.0001}
                          prefix="Rp"
                          required={form.values.isAssistant}
                          {...form.getInputProps(`costOptions.${idx}.cost`)}
                        />
                        <Group align="center" wrap="nowrap">
                          <TextInput
                            label="Title"
                            placeholder="Enter cost option title"
                            required
                            {...form.getInputProps(`costOptions.${idx}.title`)}
                            style={{ flex: 1 }}
                          />
                          <TextInput
                            label="Description"
                            placeholder="Enter cost option description"
                            {...form.getInputProps(`costOptions.${idx}.desc`)}
                            style={{ flex: 1 }}
                          />
                        </Group>
                        <Group align="center" wrap="nowrap">
                          <NumberInput
                            label="Minimum Duration"
                            min={1}
                            required={form.values.isAssistant}
                            {...form.getInputProps(`costOptions.${idx}.minTime`)}
                            onChange={(e) => {
                              form.setFieldValue(`costOptions.${idx}.minTime`, Number(e));
                              if (Number(e) > form.values.costOptions[idx].minTime) {
                                form.setFieldValue(`costOptions.${idx}.maxTime`, Number(e));
                              }
                            }}
                            style={{ flex: 1 }}
                          />
                          <NumberInput
                            label="Maximum Duration"
                            min={1}
                            required={form.values.isAssistant}
                            {...form.getInputProps(`costOptions.${idx}.maxTime`)}
                            style={{ flex: 1 }}
                          />
                        </Group>
                      </Stack>

                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeCostOption(idx)}
                        aria-label="Delete place"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}

                <Button variant="light" onClick={addCostOption}>
                  + Add New Cost Option
                </Button>
              </Stack>
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
                    required
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

          {form.values.isAssistant && (
            <>
              {/* Questions */}
              <Divider label="Questions" />
              <Stack gap="sm">
                {form.values.questions.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No questions yet. Add one below.
                  </Text>
                )}

                {form.values.questions.map((question, idx) => (
                  <Paper key={idx} p="sm" radius="md" withBorder>
                    <Group align="center" wrap="nowrap">
                      <Stack style={{ flex: 1 }}>
                        <TextInput
                          label="Question Form"
                          placeholder="Enter question form"
                          {...form.getInputProps(`questions.${idx}.questionText`)}
                          required
                          style={{ flex: 1 }}
                        />
                        <Group align="center" wrap="nowrap">
                          <TextInput
                            label="Description"
                            placeholder="Enter description name"
                            {...form.getInputProps(`questions.${idx}.description`)}
                            style={{ flex: 1 }}
                          />
                          <Select
                            label="Question Type"
                            placeholder="Select type"
                            searchable
                            data={Object.values(QuestionType).map((value) => ({
                              label: value.charAt(0) + value.slice(1).toLowerCase(), // e.g. "Text"
                              value,
                            }))}
                            {...form.getInputProps(`questions.${idx}.type`)}
                            required
                            style={{ flex: 1 }}
                          />
                        </Group>
                        {(question.type === 'SELECT' || question.type === 'MULTISELECT') && (
                          <TagsInput
                            label="Options"
                            placeholder="Add options"
                            {...form.getInputProps(`questions.${idx}.options`)}
                            required={question.type === 'SELECT' || question.type === 'MULTISELECT'}
                            style={{ flex: 1 }}
                          />
                        )}
                        <Group align="center" gap="xs">
                          <Switch
                            {...form.getInputProps(`questions.${idx}.required` as any, {
                              type: 'checkbox',
                            })}
                          />
                          <Text size="sm">
                            {form.values.questions[idx].required ? 'Required' : 'Optional'}
                          </Text>
                        </Group>
                        <Divider label="Optional" />

                        <Group align="end" style={{ gap: 12 }}>
                          <Stack style={{ flex: 1 }}>
                            {question.imageUrl && (
                              <Image
                                src={question.imageUrl}
                                alt={`question-${idx}-image`}
                                radius="md"
                                width={200}
                                fit="contain"
                              />
                            )}
                            {question.image && (
                              <Text size="xs" c="dimmed">
                                {question.image.name}
                              </Text>
                            )}

                            <FileButton
                              onChange={(file) => {
                                if (file instanceof File) {
                                  const objectUrl = URL.createObjectURL(file);
                                  form.setFieldValue(`questions.${idx}.image`, file);
                                  form.setFieldValue(`questions.${idx}.imageUrl`, objectUrl);
                                }
                              }}
                              accept="image/*"
                            >
                              {(props) => (
                                <Button {...props} variant="light">
                                  {question.imageUrl ? 'Change Image' : 'Upload Image'}
                                </Button>
                              )}
                            </FileButton>
                          </Stack>

                          <TextInput
                            label="Link URL"
                            placeholder="Enter link URL"
                            {...(form.getInputProps(`questions.${idx}.linkURL` as any) as any)}
                            style={{ flex: 1 }}
                          />
                        </Group>
                      </Stack>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeQuestion(idx)}
                        aria-label="Delete place"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}

                <Button variant="light" onClick={addQuestion}>
                  + Add New Question
                </Button>
              </Stack>

              {/* Declarations */}
              <Divider label="Declarations" />
              <Stack gap="sm">
                {form.values.declarations.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No declarations yet. Add one below.
                  </Text>
                )}

                {form.values.declarations.map((declaration, idx) => (
                  <DeclarationEditor
                    key={declaration.id}
                    idx={idx}
                    declaration={declaration}
                    form={form}
                    removeDeclaration={removeDeclaration}
                  />
                ))}

                <Button variant="light" onClick={addDeclaration}>
                  + Add New Declaration
                </Button>
              </Stack>

              {/* Complete Order Declarations */}
              <Divider label="Complete Order Declarations" />
              <Stack gap="sm">
                {form.values.completeForms.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No complete order declarations yet. Add one below.
                  </Text>
                )}

                {form.values.completeForms.map((declaration, idx) => (
                  <CompleteOrderDeclarationEditor
                    key={declaration.id}
                    idx={idx}
                    declaration={declaration}
                    form={form}
                    removeDeclaration={removeCompleteForm}
                  />
                ))}

                <Button variant="light" onClick={addCompleteForm}>
                  + Add New Complete Order Declaration
                </Button>
              </Stack>

              {/* ===================== CUSTOM COST BUILDER ===================== */}
              <Divider label="Custom Cost Calculation" />

              <CustomCostBuilder
                tokens={form.values.costFormula?.tokens ?? []}
                questions={form.values.questions.map((q) => ({
                  id: q.id!,
                  questionText: q.questionText,
                  type: q.type,
                }))}
                onChange={(nextTokens) => form.setFieldValue('costFormula.tokens', nextTokens)}
              />

              {/* ===================== FORMULA PREVIEW ===================== */}
              {(form.values.costFormula?.tokens.length as number) > 0 ? (
                <>
                  <Divider label="Formula Preview" />
                  <Paper withBorder p="md" radius="md">
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Expression
                      </Text>

                      <Text size="sm" ff="monospace" c="blue" style={{ whiteSpace: 'pre-wrap' }}>
                        {buildFormulaExpression(
                          form.values.costFormula?.tokens ?? [],
                          form.values.questions
                        ) || '—'}
                      </Text>

                      <Divider />

                      <Text size="sm" fw={500}>
                        Simulated Result
                      </Text>

                      <Text size="lg" fw={700}>
                        Rp{' '}
                        {evaluateFormula(form.values.costFormula?.tokens ?? [])?.toLocaleString(
                          'id-ID'
                        ) ?? '—'}
                      </Text>

                      <Text size="xs" c="dimmed">
                        Uses example values only. Final calculation happens on order submission.
                      </Text>

                      {costBreakdown.length > 0 && (
                        <>
                          <Divider label="Cost Breakdown Preview" />

                          <Stack gap={4}>
                            {costBreakdown.map((item) => (
                              <Group key={item.label} justify="space-between">
                                <Text size="sm">{item.label}</Text>
                                <Text size="sm" fw={500}>
                                  Rp {item.value.toLocaleString('id-ID')}
                                </Text>
                              </Group>
                            ))}

                            <Divider />

                            <Group justify="space-between">
                              <Text size="sm" fw={600}>
                                Sub Total
                              </Text>
                              <Text size="sm" fw={700}>
                                Rp {breakdownSubtotal.toLocaleString('id-ID')}
                              </Text>
                            </Group>
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Paper>
                </>
              ) : null}
            </>
          )}
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
