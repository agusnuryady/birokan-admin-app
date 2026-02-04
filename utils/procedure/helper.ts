/* ================= TYPES ================= */

import {
  CostFormulaToken,
  SymbolToken,
  SymbolValue,
  VariableToken,
} from '@/app/(app)/procedure/_components/custom-cost/types';
import { ProcedureQuestionInput } from '@/services/procedureService';

/* ================ LABELS & EXPORTS ================= */

export const SYMBOL_LABELS: Record<SymbolValue, string> = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
  '(': '(',
  ')': ')',
  '>': '>',
  '<': '<',
  '>=': '≥',
  '<=': '≤',
  '==': '=',
  ',': ',',
  IF: 'IF',
  TODAY: 'TODAY',
  DATEDIFF_DAYS: 'DATEDIFF_DAYS',
  DATEDIFF_MONTHS: 'DATEDIFF_MONTHS',
  ROUND_UP: 'ROUND_UP',
  ROUND_DOWN: 'ROUND_DOWN',
  YEAR: 'YEAR',
};

/* ================== UTIL ================== */

export function diffDays(from: number, to: number): number {
  const start = new Date(from);
  const end = new Date(to);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);

  return Math.max(0, diff);
}

export function diffMonths(from: number, to: number): number {
  const start = new Date(from);
  const end = new Date(to);

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

function roundUp(value: number, unit = 1): number {
  if (!unit || unit <= 0) {
    return value;
  }
  return Math.ceil(value / unit) * unit;
}

function roundDown(value: number, unit = 1): number {
  if (!unit || unit <= 0) {
    return value;
  }
  return Math.floor(value / unit) * unit;
}

/* ================== TYPE GUARDS ================== */

function isSymbolToken(t: CostFormulaToken | undefined): t is SymbolToken {
  return !!t && (t as any).type === 'SYMBOL';
}
function isVariableToken(t: CostFormulaToken | undefined): t is VariableToken {
  return !!t && (t as any).type === 'VARIABLE';
}

/* ================== EVALUATOR ================== */

export const evaluateFormula = (tokens: CostFormulaToken[]): number | null => {
  try {
    let idx = 0;

    const peek = (offset = 0) => tokens[idx + offset];
    const consume = () => tokens[idx++];
    const eof = () => idx >= tokens.length;

    const toNumberFromVariable = (v: VariableToken): number => {
      const raw =
        v.source === 'FIXED' ? (v.fixedValue ?? v.sampleValue) : (v.sampleValue ?? v.fixedValue);
      if (raw === undefined || raw === null || raw === '') {
        return 0;
      }
      return typeof raw === 'string' ? Number(raw) || 0 : Number(raw);
    };

    const evalValueForCondition = (slice: CostFormulaToken[]): string | number => {
      // Single VARIABLE → return raw value (string or number)
      if (slice.length === 1 && isVariableToken(slice[0])) {
        const v = slice[0];
        const raw =
          v.source === 'FIXED' ? (v.fixedValue ?? v.sampleValue) : (v.sampleValue ?? v.fixedValue);

        return raw ?? '';
      }

      // Single TODAY
      if (slice.length === 1 && isSymbolToken(slice[0]) && slice[0].symbol === 'TODAY') {
        return Date.now();
      }

      // Fallback: numeric evaluation
      return evaluateFormula(slice) ?? 0;
    };

    // parseFactor -> numbers, variables, functions, grouped expressions
    const parseFactor = (): number => {
      const t = peek();
      if (!t) {
        return 0;
      }

      // Parentheses (group)
      if (isSymbolToken(t) && t.symbol === '(') {
        consume(); // '('
        const val = parseExpression();
        // consume ')'
        if (isSymbolToken(peek()) && (peek() as SymbolToken).symbol === ')') {
          consume();
        }
        return val;
      }

      // Function-like SYMBOL tokens: IF, ROUND_UP, ROUND_DOWN, DATEDIFF_DAYS, DATEDIFF_MONTHS, YEAR, TODAY
      if (
        isSymbolToken(t) &&
        [
          'IF',
          'ROUND_UP',
          'ROUND_DOWN',
          'DATEDIFF_DAYS',
          'DATEDIFF_MONTHS',
          'YEAR',
          'TODAY',
        ].includes(t.symbol)
      ) {
        const fn = (consume() as SymbolToken).symbol;

        // TODAY (no paren or with paren)
        if (fn === 'TODAY') {
          return Date.now();
        }

        // expect '('
        if (!isSymbolToken(peek()) || (peek() as SymbolToken).symbol !== '(') {
          return 0;
        }
        consume(); // '('

        // helper to read comma-separated args until matching ')'
        const readArgs = (): CostFormulaToken[][] => {
          const args: CostFormulaToken[][] = [];
          let start = idx;
          let depth = 0;
          while (!eof()) {
            const cur = peek();
            // adjust depth for nested parens encountered while scanning tokens (we track nestedness inside this arg scan)
            if (isSymbolToken(cur)) {
              if (cur.symbol === '(') {
                depth++;
              }
              if (cur.symbol === ')') {
                if (depth === 0) {
                  // end of args region
                  const slice = tokens.slice(start, idx);
                  args.push(slice);
                  break;
                } else {
                  depth--;
                }
              }
              // comma at depth 0 separates args
              if (cur.symbol === ',' && depth === 0) {
                const slice = tokens.slice(start, idx);
                args.push(slice);
                // consume comma and move start
                consume(); // comma
                start = idx;
                continue;
              }
            }
            consume();
          }
          // consume the closing ')'
          if (isSymbolToken(peek()) && (peek() as SymbolToken).symbol === ')') {
            consume();
          }
          return args;
        };

        const rawArgs = readArgs();

        if (fn === 'IF') {
          // Expect exactly 3 arguments: condition (a comparison expression as tokens), trueExpr, falseExpr
          if (rawArgs.length < 3) {
            return 0;
          }
          const condSlice = rawArgs[0];
          // We'll evaluate condition: find comparison operator inside condSlice (==, >, <, >=, <=)
          let opIdx = -1;
          let opSym: SymbolValue | null = null;
          let depth = 0;
          for (let i = 0; i < condSlice.length; i++) {
            const tk = condSlice[i];
            if (isSymbolToken(tk) && tk.symbol === '(') {
              depth++;
            }
            if (isSymbolToken(tk) && tk.symbol === ')') {
              depth--;
            }
            if (
              depth === 0 &&
              isSymbolToken(tk) &&
              ['==', '>', '<', '>=', '<='].includes(tk.symbol)
            ) {
              opIdx = i;
              opSym = tk.symbol;
              break;
            }
          }
          if (opIdx === -1 || !opSym) {
            return 0;
          }

          const leftSlice = condSlice.slice(0, opIdx);
          const rightSlice = condSlice.slice(opIdx + 1);

          const left = evalValueForCondition(leftSlice);
          const right = evalValueForCondition(rightSlice);

          let cond = false;
          if (opSym === '==') {
            cond = String(left) === String(right);
          } else if (opSym === '>') {
            cond = Number(left) > Number(right);
          } else if (opSym === '<') {
            cond = Number(left) < Number(right);
          } else if (opSym === '>=') {
            cond = Number(left) >= Number(right);
          } else if (opSym === '<=') {
            cond = Number(left) <= Number(right);
          }

          const trueVal = evaluateFormula(rawArgs[1]) ?? 0;
          const falseVal = evaluateFormula(rawArgs[2]) ?? 0;
          return cond ? trueVal : falseVal;
        }

        if (fn === 'ROUND_UP' || fn === 'ROUND_DOWN') {
          const v = rawArgs[0] ?? [];
          const u = rawArgs[1] ?? [];
          const value = evaluateFormula(v) ?? 0;
          const unit = u && u.length ? (evaluateFormula(u) ?? 1) : 1;
          return fn === 'ROUND_UP'
            ? roundUp(Number(value), Number(unit))
            : roundDown(Number(value), Number(unit));
        }

        if (fn === 'DATEDIFF_DAYS' || fn === 'DATEDIFF_MONTHS') {
          const aSlice = rawArgs[0] ?? [];
          const bSlice = rawArgs[1] ?? [];
          const aVal = evaluateFormula(aSlice) ?? 0;
          const bVal = evaluateFormula(bSlice) ?? 0;
          if (fn === 'DATEDIFF_DAYS') {
            return diffDays(Number(bVal), Number(aVal));
          }
          return diffMonths(Number(bVal), Number(aVal));
        }

        if (fn === 'YEAR') {
          const s = rawArgs[0] ?? [];
          const v = evaluateFormula(s) ?? 0;
          // if it's TODAY or numeric timestamp, convert to year
          const n = Number(v) || 0;
          if (!Number.isFinite(n) || n === 0) {
            return 0;
          }
          return new Date(n).getFullYear();
        }

        // fallback
        return 0;
      }

      // Variable token (single)
      if (isVariableToken(t)) {
        consume();
        return toNumberFromVariable(t);
      }

      // Symbol that is a numeric literal? (we don't have numeric tokens, variables hold numbers)
      // If an unexpected symbol, just consume and return 0
      consume();
      return 0;
    };

    // parseTerm handles * and /
    const parseTerm = (): number => {
      let left = parseFactor();
      while (!eof()) {
        const t = peek();
        if (!isSymbolToken(t) || (t.symbol !== '*' && t.symbol !== '/')) {
          break;
        }
        const op = (consume() as SymbolToken).symbol;
        const right = parseFactor();
        if (op === '*') {
          left = Number(left) * Number(right);
        } else {
          left = Number(right) === 0 ? 0 : Number(left) / Number(right);
        }
      }
      return left;
    };

    // parseExpression handles + and -
    const parseExpression = (): number => {
      let left = parseTerm();
      while (!eof()) {
        const t = peek();
        if (!isSymbolToken(t) || (t.symbol !== '+' && t.symbol !== '-')) {
          break;
        }
        const op = (consume() as SymbolToken).symbol;
        const right = parseTerm();
        if (op === '+') {
          left = Number(left) + Number(right);
        } else {
          left = Number(left) - Number(right);
        }
      }
      return left;
    };

    // We need a small wrapper to allow recursion when evaluating sub-slices:
    // when evaluateFormula is called recursively for slices, it will call this entire code again,
    // but to avoid infinite recursion, detect when called with the same function and a fresh idx.
    // For simplicity, if evaluateFormula is called recursively we will run parse on the provided tokens by creating
    // a fresh inner evaluator: so we implement a separate small wrapper when needed below.

    // The current invocation should parse the entire tokens array; but because we wrote functions that call evaluateFormula recursively,
    // ensure those recursive calls use the global evaluateFormula (which is fine).

    // Start parse
    const result = parseExpression();
    // const rounded = Math.ceil(result / 1000) * 1000;
    // return Number.isFinite(rounded) ? rounded : null;

    return Number.isFinite(result) ? result : null;
  } catch (e) {
    // console.error('evaluateFormula parser error', e);
    return null;
  }
};

/* =================== BREAKDOWN & EXPRESSION =================== */

export function roundUpToNearest(value: number, unit = 1000): number {
  if (!Number.isFinite(value) || !unit || unit <= 0) {
    return value;
  }
  return Math.ceil(value / unit) * unit;
}

export const calculateCostBreakdown = (tokens: CostFormulaToken[]) => {
  const groups = new Map<string, CostFormulaToken[]>();

  tokens.forEach((t) => {
    if (!t.costGroup) {
      return;
    }

    if (!groups.has(t.costGroup)) {
      groups.set(t.costGroup, []);
    }
    groups.get(t.costGroup)!.push(t);
  });

  const result: { label: string; value: number }[] = [];

  for (const [group, groupTokens] of Array.from(groups.entries())) {
    const value = evaluateFormula(groupTokens);
    if (typeof value === 'number' && value !== 0) {
      // round up each breakdown value to nearest 1000
      const rounded = roundUpToNearest(value, 1000);
      result.push({ label: group, value: rounded });
    }
  }

  return result;
};

export function buildFormulaExpression(
  tokens: CostFormulaToken[],
  questions: ProcedureQuestionInput[]
) {
  return tokens
    .map((t) => {
      if (isSymbolToken(t)) {
        return SYMBOL_LABELS[t.symbol] ?? t.symbol;
      }

      if (isVariableToken(t)) {
        // FIXED
        if (t.source === 'FIXED') {
          return t.title ? `${t.title} (${t.fixedValue ?? 0})` : String(t.fixedValue ?? 0);
        }

        // QUESTION
        const q = questions.find((q) => q.id === t.questionId);

        if (!q) {
          return '❓QUESTION';
        }

        // DATE hint
        if (q.type === 'DATE') {
          return `${q.questionText} (DATE)`;
        }

        return q.questionText;
      }

      return '';
    })
    .join(' ');
}

export interface ReminderTemplateContext {
  user_name: string;
  procedure_name: string;
  event_date: string;
}

type Formatter<T> = (value: T) => string;

const FORMATTERS: {
  [K in keyof ReminderTemplateContext]: Formatter<ReminderTemplateContext[K]>;
} = {
  user_name: (v) => v,
  procedure_name: (v) => v,
  event_date: (v) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(v)),
};

export function renderReminderTemplate(
  template: string | null | undefined,
  context: ReminderTemplateContext
): string {
  if (!template) {
    return '';
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: keyof ReminderTemplateContext) => {
    const value = context[key];
    const formatter = FORMATTERS[key];

    if (!value || !formatter) {
      return '';
    }

    return formatter(value as string & Date);
  });
}
