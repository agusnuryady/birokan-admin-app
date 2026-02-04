'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  FileButton,
  Group,
  Image,
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
  ValidationConditionOperator,
  ValidationOperator,
} from '@/services/procedureService';
import {
  buildFormulaExpression,
  calculateCostBreakdown,
  evaluateFormula,
  roundUpToNearest,
} from '@/utils/procedure/helper';
import { AgentDeclarationEditor } from './AgentDeclarationEditor';
import { CompleteOrderDeclarationEditor } from './CompleteOrderDeclarationEditor';
import { CustomCostBuilder } from './custom-cost/CustomCostBuilder';
import { DeclarationEditor } from './DeclarationEditor';
import StepList from './StepList';

/* ================= VALIDATION CONSTANTS ================= */

const OPERATOR_LABELS: Record<ValidationOperator, string> = {
  REQUIRED: 'Required',
  MIN_LENGTH: 'Minimum Length',
  MAX_LENGTH: 'Maximum Length',
  REGEX: 'Regex Match',
  MIN: 'Minimum Value',
  MAX: 'Maximum Value',
  IN: 'Allowed Values',

  DATE_NOT_OLDER_THAN_YEARS: 'Date not older than (years)',
  DATE_NOT_BEFORE: 'Date not before',
  DATE_NOT_AFTER: 'Date not after',
};

function getOperatorsByQuestionType(type?: QuestionType): ValidationOperator[] {
  if (!type) {
    return Object.values(ValidationOperator);
  }

  switch (type) {
    case QuestionType.DATE:
      return [
        ValidationOperator.REQUIRED,
        ValidationOperator.DATE_NOT_OLDER_THAN_YEARS,
        ValidationOperator.DATE_NOT_BEFORE,
        ValidationOperator.DATE_NOT_AFTER,
      ];

    case QuestionType.NUMBER:
      return [ValidationOperator.REQUIRED, ValidationOperator.MIN, ValidationOperator.MAX];

    case QuestionType.TEXT:
      return [
        ValidationOperator.REQUIRED,
        ValidationOperator.MIN_LENGTH,
        ValidationOperator.MAX_LENGTH,
        ValidationOperator.REGEX,
      ];

    case QuestionType.SELECT:
    case QuestionType.MULTISELECT:
      return [ValidationOperator.REQUIRED, ValidationOperator.IN];

    default:
      return [ValidationOperator.REQUIRED];
  }
}

/* ================= CONDITION CONSTANTS ================= */

const CONDITION_OPERATOR_LABELS: Record<ValidationConditionOperator, string> = {
  EQUALS: 'Equals',
  NOT_EQUALS: 'Not Equals',
  IN: 'In List',
  NOT_IN: 'Not In List',
  EXISTS: 'Has Value',
};

/* ================= PROPS ================= */

type ProcedureFormPageProps = {
  mode: 'add' | 'edit';
  initialValues?: Partial<ProcedureFormValues>;
  dropdownData: ProcedureDropdownResponse;
  onSubmit: (values: ProcedureFormValues) => Promise<void>;
};

/* ================= PAGE ================= */

export default function ProcedureFormPage({
  mode,
  initialValues,
  dropdownData,
  onSubmit,
}: ProcedureFormPageProps) {
  const router = useRouter();

  /* ================= FORM ================= */

  const form = useForm<ProcedureFormValues>({
    initialValues: {
      directoryId: '',
      name: '',
      slug: '',
      description: '',
      isActive: true,
      isAssistant: false,
      isReminder: false,
      costOptions: [],
      requirements: [],
      documents: [],
      places: [],
      steps: [],
      questions: [],
      questionsValidation: [],
      declarations: [],
      agentDeclarations: [],
      completeForms: [],
      costFormula: { tokens: [] },
      reminderTemplate: null,
      // ...initialValues,
    },
  });

  const [options, setOptions] = useState<string[]>([]);

  /* ================= INIT (SAME AS MODAL) ================= */

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    form.setValues({
      ...form.values,
      ...initialValues,
      description: initialValues.description || '',
      costFormula: initialValues.costFormula?.tokens ? initialValues.costFormula : { tokens: [] },
      reminderTemplate: initialValues.reminderTemplate ?? null,
    } as ProcedureFormValues);

    const defaultOptions = initialValues.steps?.map((s) => s.group) || [];
    const dropdownDefaults = dropdownData.stepGroup?.map((s) => s.group) || [];

    setOptions(Array.from(new Set([...defaultOptions, ...dropdownDefaults])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= HELPERS ================= */

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
        {
          id: crypto.randomUUID(),
          questionText: '',
          type: QuestionType.TEXT,
          required: true,
          description: '',
          options: [],
          linkURL: '',
          image: null,
          imageUrl: '',
        },
      ],
    });

  const removeQuestion = (index: number) => {
    const questions = [...form.values.questions];
    questions.splice(index, 1);
    form.setValues({ ...form.values, questions });
  };

  const addValidationRule = () =>
    form.setFieldValue('questionsValidation', [
      ...form.values.questionsValidation,
      {
        targetField: '',
        operator: ValidationOperator.REQUIRED,
        message: '',
        isActive: true,
        condition: undefined,
      },
    ]);

  const removeValidationRule = (index: number) => {
    const rules = [...form.values.questionsValidation];
    rules.splice(index, 1);
    form.setFieldValue('questionsValidation', rules);
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

  const addAgentDeclaration = () =>
    form.setValues({
      ...form.values,
      agentDeclarations: [
        ...form.values.agentDeclarations,
        { id: crypto.randomUUID(), title: '', boldText: '', content: '' },
      ],
    });

  const removeAgentDeclaration = (index: number) => {
    const agentDeclarations = [...form.values.agentDeclarations];
    agentDeclarations.splice(index, 1);
    form.setValues({ ...form.values, agentDeclarations });
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

  /* ================= FORMULA ENGINE (UNCHANGED) ================= */

  const costBreakdown = useMemo(() => {
    return calculateCostBreakdown(form.values.costFormula?.tokens ?? []);
  }, [form.values.costFormula?.tokens]);

  const breakdownSubtotal = useMemo(() => {
    return costBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [costBreakdown]);

  /* ================= QUESTION OPTIONS FOR VALIDATION ================= */

  const questionSelectOptions = useMemo(
    () =>
      form.values.questions.map((q) => ({
        value: q.id!,
        label: `${q.questionText} (${q.type})`,
      })),
    [form.values.questions]
  );

  const conditionQuestionOptions = useMemo(
    () =>
      form.values.questions.map((q) => ({
        value: q.id!,
        label: `${q.questionText} (${q.type})`,
      })),
    [form.values.questions]
  );

  /* ================= RENDER ================= */

  return (
    <Box px="lg" pb={80}>
      {/* ================= HEADER ================= */}
      <Group justify="space-between" mb="md">
        <Text fw={700} size="xl">
          {mode === 'add' ? 'Add Procedure' : 'Edit Procedure'}
        </Text>
      </Group>

      <form onSubmit={form.onSubmit(onSubmit)}>
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

            {form.values.isAssistant && (
              <Group gap="xs" align="center">
                <Switch {...form.getInputProps('isReminder', { type: 'checkbox' })} />
                <Text size="sm">Is Reminder</Text>
              </Group>
            )}
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

          {form.values.isAssistant && form.values.isReminder && (
            <>
              <Divider label="Reminder Configuration" />

              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Group align="center" justify="space-between">
                    <Text fw={500}>Enable Reminder</Text>
                    <Switch
                      checked={!!form.values.reminderTemplate}
                      onChange={(e) => {
                        if (e.currentTarget.checked) {
                          form.setFieldValue('reminderTemplate', {
                            frequency: 'YEARLY',
                            offsetType: 'ONE_MONTH',
                            dateSource: 'ORDER_DATE',
                            titleTemplate: '',
                            descTemplate: '',
                          });
                        } else {
                          form.setFieldValue('reminderTemplate', null);
                        }
                      }}
                    />
                  </Group>

                  {form.values.reminderTemplate && (
                    <>
                      {/* Frequency */}
                      <Group grow>
                        <Select
                          label="Reminder Frequency"
                          data={[
                            { label: 'Monthly', value: 'MONTHLY' },
                            { label: 'Yearly', value: 'YEARLY' },
                            { label: 'Every 5 Years', value: 'FIVE_YEARS' },
                            { label: 'Custom', value: 'CUSTOM' },
                          ]}
                          {...form.getInputProps('reminderTemplate.frequency')}
                          required
                        />

                        {form.values.reminderTemplate.frequency === 'CUSTOM' && (
                          <NumberInput
                            label="Custom Interval (months)"
                            min={1}
                            {...form.getInputProps('reminderTemplate.intervalValue')}
                            required
                          />
                        )}
                      </Group>

                      {/* Offset */}
                      <Group grow>
                        <Select
                          label="Reminder Time"
                          data={[
                            { label: '1 Week Before', value: 'ONE_WEEK' },
                            { label: '1 Month Before', value: 'ONE_MONTH' },
                            { label: 'Custom', value: 'CUSTOM' },
                          ]}
                          {...form.getInputProps('reminderTemplate.offsetType')}
                          required
                        />

                        {form.values.reminderTemplate.offsetType === 'CUSTOM' && (
                          <NumberInput
                            label="Custom Offset (days before)"
                            min={1}
                            {...form.getInputProps('reminderTemplate.offsetValue')}
                            required
                          />
                        )}
                      </Group>

                      {/* Date Source */}
                      <Select
                        label="Reminder Date Source"
                        data={[
                          { label: 'Order Created Date', value: 'ORDER_CREATED_AT' },
                          { label: 'Order Selected Date', value: 'ORDER_DATE' },
                          { label: 'From Order Form Answer', value: 'ORDER_FORM_ANSWER' },
                        ]}
                        {...form.getInputProps('reminderTemplate.dateSource')}
                        required
                      />

                      {form.values.reminderTemplate.dateSource === 'ORDER_FORM_ANSWER' && (
                        <Select
                          label="Order Form Question (Date)"
                          placeholder="Select date question"
                          data={form.values.questions
                            .filter((q) => q.type === 'DATE')
                            .map((q) => ({
                              label: q.questionText,
                              value: q.id!,
                            }))}
                          {...form.getInputProps('reminderTemplate.dateKey')}
                          required
                        />
                      )}

                      {/* Content */}
                      <TextInput
                        label="Reminder Title"
                        placeholder="e.g. Perpanjangan STNK"
                        {...form.getInputProps('reminderTemplate.titleTemplate')}
                        required
                      />

                      <Textarea
                        label="Reminder Description"
                        placeholder="Optional reminder message"
                        {...form.getInputProps('reminderTemplate.descTemplate')}
                      />

                      <Text size="xs" c="dimmed">
                        Available variables:
                        <br />
                        <code>{'{{user_name}}'}</code>, <code>{'{{procedure_name}}'}</code>,{' '}
                        <code>{'{{event_date}}'}</code>
                      </Text>
                    </>
                  )}
                </Stack>
              </Paper>
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
                          onChange={(v) => {
                            const slug = dropdownData.directory.find((item) => item.id === v)?.slug;
                            form.setFieldValue(`documents.${idx}.directoryId`, v as string);
                            form.setFieldValue(`documents.${idx}.directorySlug`, slug);
                          }}
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
                            {...form.getInputProps(`questions.${idx}.linkURL`)}
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

              <Divider label="Form Question Validation Rules" />
              <Stack gap="sm">
                {form.values.questionsValidation.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No validation rules yet. These rules validate user input when ordering.
                  </Text>
                )}

                {form.values.questionsValidation.map((rule, idx) => {
                  const targetQuestion = form.values.questions.find(
                    (q) => q.id === rule.targetField
                  );

                  const conditionQuestion = form.values.questions.find(
                    (q) => q.id === rule.condition?.questionId
                  );

                  return (
                    <Paper key={idx} p="sm" radius="md" withBorder>
                      <Group align="flex-start" wrap="nowrap">
                        <Stack style={{ flex: 1 }} gap="xs">
                          {/* ================= TARGET ================= */}
                          <Select
                            label="Target Question"
                            data={questionSelectOptions}
                            searchable
                            clearable
                            {...form.getInputProps(`questionsValidation.${idx}.targetField`)}
                            required
                          />

                          {targetQuestion && (
                            <Text size="xs" c="dimmed">
                              Target type: <b>{targetQuestion.type}</b>
                            </Text>
                          )}

                          {/* ================= OPERATOR ================= */}
                          <Select
                            label="Validation Operator"
                            data={getOperatorsByQuestionType(targetQuestion?.type).map((op) => ({
                              value: op,
                              label: OPERATOR_LABELS[op],
                            }))}
                            {...form.getInputProps(`questionsValidation.${idx}.operator`)}
                            required
                          />

                          {/* ================= VALUE ================= */}
                          <Textarea
                            label="Comparison Value"
                            placeholder='Examples: 2, "^[A-Z0-9]{8}$", ["A","B"]'
                            {...form.getInputProps(`questionsValidation.${idx}.value`)}
                          />

                          {/* ================= CONDITION ================= */}
                          <Divider label="Condition (optional)" />

                          <Switch
                            label="Enable Condition"
                            checked={!!rule.condition}
                            onChange={(e) => {
                              if (e.currentTarget.checked) {
                                form.setFieldValue(`questionsValidation.${idx}.condition`, {
                                  questionId: '',
                                  operator: ValidationConditionOperator.EQUALS,
                                  value: undefined,
                                });
                              } else {
                                form.setFieldValue(
                                  `questionsValidation.${idx}.condition`,
                                  undefined
                                );
                              }
                            }}
                          />

                          {rule.condition && (
                            <>
                              <Select
                                label="Condition Question"
                                data={conditionQuestionOptions}
                                searchable
                                clearable
                                {...form.getInputProps(
                                  `questionsValidation.${idx}.condition.questionId`
                                )}
                                required
                              />

                              <Select
                                label="Condition Operator"
                                data={(
                                  Object.keys(
                                    CONDITION_OPERATOR_LABELS
                                  ) as ValidationConditionOperator[]
                                ).map((op) => ({
                                  value: op,
                                  label: CONDITION_OPERATOR_LABELS[op],
                                }))}
                                {...form.getInputProps(
                                  `questionsValidation.${idx}.condition.operator`
                                )}
                                required
                              />

                              {rule.condition.operator !== 'EXISTS' && (
                                <Textarea
                                  label="Condition Value"
                                  placeholder='Examples: "YES", ["A","B"]'
                                  value={
                                    rule.condition.value !== undefined
                                      ? JSON.stringify(rule.condition.value)
                                      : ''
                                  }
                                  onChange={(e) => {
                                    try {
                                      form.setFieldValue(
                                        `questionsValidation.${idx}.condition.value`,
                                        JSON.parse(e.currentTarget.value)
                                      );
                                    } catch {
                                      form.setFieldValue(
                                        `questionsValidation.${idx}.condition.value`,
                                        e.currentTarget.value
                                      );
                                    }
                                  }}
                                />
                              )}

                              {conditionQuestion && (
                                <Text size="xs" c="dimmed">
                                  Condition type: <b>{conditionQuestion.type}</b>
                                </Text>
                              )}
                            </>
                          )}

                          {/* ================= ERROR ================= */}
                          <TextInput
                            label="Error Message"
                            {...form.getInputProps(`questionsValidation.${idx}.message`)}
                            required
                          />

                          {/* ================= ACTIVE ================= */}
                          <Group gap="xs">
                            <Switch
                              checked={rule.isActive ?? true}
                              onChange={(e) =>
                                form.setFieldValue(
                                  `questionsValidation.${idx}.isActive`,
                                  e.currentTarget.checked
                                )
                              }
                            />
                            <Text size="sm">{rule.isActive ? 'Active' : 'Inactive'}</Text>
                          </Group>
                        </Stack>

                        <ActionIcon
                          color="red"
                          variant="light"
                          mt={28}
                          onClick={() => removeValidationRule(idx)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  );
                })}

                <Button variant="light" onClick={addValidationRule}>
                  + Add Question Validation Rule
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

              {/* Declarations */}
              <Divider label="Agent Declarations" />
              <Stack gap="sm">
                {form.values.agentDeclarations.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No agent declarations yet. Add one below.
                  </Text>
                )}

                {form.values.agentDeclarations.map((ad, idx) => (
                  <AgentDeclarationEditor
                    key={ad.id}
                    idx={idx}
                    agentDeclarations={ad}
                    form={form}
                    removeDeclaration={removeAgentDeclaration}
                  />
                ))}

                <Button variant="light" onClick={addAgentDeclaration}>
                  + Add New Agent Declaration
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
              {(form.values.costFormula?.tokens?.length as number) > 0 ? (
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
                        {roundUpToNearest(
                          evaluateFormula(form.values.costFormula?.tokens ?? []) ?? 0,
                          1000
                        )?.toLocaleString('id-ID') ?? '—'}
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

        {/* ================= STICKY FOOTER ================= */}
        <Box
          pos="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          py="sm"
          px="lg"
          style={{ borderTop: '1px solid #eee', zIndex: 20 }}
        >
          <Group justify="flex-end">
            <Button variant="default" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">{mode === 'add' ? 'Create Procedure' : 'Save Changes'}</Button>
          </Group>
        </Box>
      </form>
    </Box>
  );
}
