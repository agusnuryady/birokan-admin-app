'use client';

import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { Button, Group, NumberInput, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { QuestionType } from '@/services/procedureService';
import StepGroupSelect from '../StepGroupSelect';
import { SortableList } from './SortableTokenBlock';
import { CostFormulaToken, SymbolToken, VariableToken } from './types';

interface QuestionOption {
  id: string;
  questionText: string;
  type: QuestionType;
}

interface CustomCostBuilderProps {
  tokens: CostFormulaToken[];
  questions: QuestionOption[];
  onChange: (tokens: CostFormulaToken[]) => void;
}

/* ================== COMPONENT ================== */

export function CustomCostBuilder({ tokens, questions, onChange }: CustomCostBuilderProps) {
  const [options, setOptions] = useState<string[]>(
    Array.from(new Set(tokens.map((t) => t.costGroup).filter((g): g is string => Boolean(g))))
  );

  const updateToken = (index: number, next: CostFormulaToken) => {
    const copy = [...tokens];
    copy[index] = next;
    onChange(copy);
  };

  const removeToken = (index: number) => {
    const copy = [...tokens];
    copy.splice(index, 1);
    onChange(copy);
  };

  /** Collect existing cost groups for Select options */
  // const costGroupOptions = Array.from(
  //   new Set(tokens.map((t) => t.costGroup).filter((g): g is string => Boolean(g)))
  // );

  return (
    <Stack gap="sm">
      <SortableList
        items={tokens}
        onChange={onChange}
        renderItem={(token, idx) => (
          <Paper p="sm" radius="md">
            <Stack gap="xs">
              {/* Header */}
              <Group justify="space-between">
                <Text fw={500}>Block #{idx + 1}</Text>
                <Button size="xs" color="red" variant="subtle" onClick={() => removeToken(idx)}>
                  <IconTrash size={14} />
                </Button>
              </Group>

              {/* ================= COST GROUP ================= */}
              <StepGroupSelect
                value={token.costGroup}
                onChange={(v) =>
                  updateToken(idx, {
                    ...token,
                    costGroup: v || undefined,
                  })
                }
                options={options}
                setOptions={setOptions}
              />

              {/* ================= BLOCK TYPE ================= */}
              <Select
                label="Block Type"
                value={token.type}
                data={[
                  { label: 'Variable', value: 'VARIABLE' },
                  { label: 'Symbol', value: 'SYMBOL' },
                  { label: 'String', value: 'STRING' },
                ]}
                onChange={(v) => {
                  if (!v) {
                    return;
                  }

                  let next: CostFormulaToken;

                  if (v === 'VARIABLE') {
                    next = {
                      id: token.id,
                      type: 'VARIABLE',
                      source: 'QUESTION',
                      role: 'MONEY',
                      valueType: 'NUMBER',
                      costGroup: token.costGroup,
                    };
                  } else if (v === 'SYMBOL') {
                    next = {
                      id: token.id,
                      type: 'SYMBOL',
                      symbol: '+',
                      costGroup: token.costGroup,
                    };
                  } else {
                    next = {
                      id: token.id,
                      type: 'STRING',
                      value: '',
                      costGroup: token.costGroup,
                    };
                  }

                  updateToken(idx, next);
                }}
              />

              {/* ================= VARIABLE ================= */}
              {token.type === 'VARIABLE' && (
                <>
                  <Select
                    label="Source"
                    value={token.source}
                    data={[
                      { label: 'Question', value: 'QUESTION' },
                      { label: 'Fixed Value', value: 'FIXED' },
                    ]}
                    onChange={(v) =>
                      updateToken(idx, {
                        ...token,
                        source: v as VariableToken['source'],
                      })
                    }
                  />

                  {/* ---------- QUESTION SOURCE ---------- */}
                  {token.source === 'QUESTION' && (
                    <>
                      <Select
                        label="Question"
                        searchable
                        data={questions.map((q) => ({
                          label: q.questionText,
                          value: q.id,
                        }))}
                        value={token.questionId}
                        onChange={(v) => {
                          const q = questions.find((x) => x.id === v);
                          if (!q) {
                            return;
                          }

                          updateToken(idx, {
                            ...token,
                            questionId: v as string,
                            valueType:
                              q.type === QuestionType.DATE
                                ? 'DATE'
                                : q.type === QuestionType.TEXT || q.type === QuestionType.SELECT
                                  ? 'STRING'
                                  : 'NUMBER',
                            role:
                              q.type === QuestionType.TEXT || q.type === QuestionType.SELECT
                                ? 'LOGIC'
                                : 'MONEY',
                          });
                        }}
                      />

                      {/* Sample values */}
                      {token.valueType === 'DATE' && (
                        <DateInput
                          label="Sample Date"
                          description="Used only for preview"
                          value={
                            typeof token.sampleValue === 'number'
                              ? new Date(token.sampleValue)
                              : null
                          }
                          onChange={(d) =>
                            updateToken(idx, {
                              ...token,
                              sampleValue: d ? new Date(d).getTime() : undefined,
                            })
                          }
                          clearable
                        />
                      )}

                      {token.valueType === 'NUMBER' && (
                        <NumberInput
                          label="Sample Number"
                          description="Used only for preview"
                          decimalScale={4}
                          value={Number(token.sampleValue ?? 0)}
                          onChange={(v) =>
                            updateToken(idx, {
                              ...token,
                              sampleValue: Number(v ?? 0),
                            })
                          }
                        />
                      )}

                      {token.valueType === 'STRING' && (
                        <TextInput
                          label="Sample String"
                          description="Used only for preview"
                          value={String(token.sampleValue ?? '')}
                          onChange={(e) =>
                            updateToken(idx, {
                              ...token,
                              sampleValue: e.currentTarget.value,
                            })
                          }
                        />
                      )}
                    </>
                  )}

                  {/* ---------- FIXED SOURCE ---------- */}
                  {token.source === 'FIXED' && (
                    <>
                      <TextInput
                        label="Title"
                        placeholder="e.g. Biaya Admin STNK"
                        value={token.title ?? ''}
                        onChange={(e) =>
                          updateToken(idx, {
                            ...token,
                            title: e.currentTarget.value,
                          })
                        }
                      />

                      <Select
                        label="Value Type"
                        value={token.valueType}
                        data={[
                          { label: 'Number', value: 'NUMBER' },
                          { label: 'String', value: 'STRING' },
                        ]}
                        onChange={(v) =>
                          updateToken(idx, {
                            ...token,
                            valueType: v as VariableToken['valueType'],
                            role: v === 'STRING' ? 'LOGIC' : 'MONEY',
                          })
                        }
                      />

                      {token.valueType === 'STRING' ? (
                        <TextInput
                          label="Fixed String Value"
                          value={String(token.fixedValue ?? '')}
                          onChange={(e) =>
                            updateToken(idx, {
                              ...token,
                              fixedValue: e.currentTarget.value,
                            })
                          }
                        />
                      ) : (
                        <NumberInput
                          label="Fixed Number Value"
                          decimalScale={4}
                          value={Number(token.fixedValue ?? 0)}
                          onChange={(v) =>
                            updateToken(idx, {
                              ...token,
                              fixedValue: Number(v ?? 0),
                            })
                          }
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {/* ================= SYMBOL ================= */}
              {token.type === 'SYMBOL' && (
                <Select
                  label="Symbol"
                  data={[
                    '+',
                    '-',
                    '*',
                    '/',
                    '(',
                    ')',
                    '>',
                    '<',
                    '>=',
                    '<=',
                    '==',
                    'IF',
                    ',',
                    'TODAY',
                    'DATEDIFF_MONTHS',
                  ].map((s) => ({ label: s, value: s }))}
                  value={token.symbol}
                  onChange={(v) =>
                    updateToken(idx, {
                      ...token,
                      symbol: v as SymbolToken['symbol'],
                    })
                  }
                />
              )}

              {/* ================= STRING ================= */}
              {token.type === 'STRING' && (
                <TextInput
                  label="String Value"
                  value={token.value}
                  onChange={(e) =>
                    updateToken(idx, {
                      ...token,
                      value: e.currentTarget.value,
                    })
                  }
                />
              )}
            </Stack>
          </Paper>
        )}
      />

      {/* ================= ADD BLOCK ================= */}
      <Button
        variant="light"
        onClick={() =>
          onChange([
            ...tokens,
            {
              id: crypto.randomUUID(),
              type: 'VARIABLE',
              source: 'QUESTION',
              role: 'MONEY',
              valueType: 'NUMBER',
            },
          ])
        }
      >
        + Add Block
      </Button>
    </Stack>
  );
}
