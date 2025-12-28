/* eslint-disable no-console */
// helper.ts
/* ================= TYPES ================= */

import {
  CostFormulaToken,
  StringToken,
  SymbolToken,
  SymbolValue,
  VariableToken,
} from '@/app/(app)/procedure/_components/custom-cost/types';
import { ProcedureQuestionInput } from '@/services/procedureService';

// export type SymbolValue =
//   | '+'
//   | '-'
//   | '*'
//   | '/'
//   | '('
//   | ')'
//   | '>'
//   | '<'
//   | '>='
//   | '<='
//   | '=='
//   | 'IF'
//   | ','
//   | 'TODAY'
//   | 'DATEDIFF_MONTHS';

// export interface BaseToken {
//   id: string;
//   costGroup?: string;
// }

// export interface SymbolToken extends BaseToken {
//   type: 'SYMBOL';
//   symbol: SymbolValue;
// }

// export interface VariableToken extends BaseToken {
//   type: 'VARIABLE';
//   source: 'QUESTION' | 'FIXED';
//   role: 'MONEY' | 'LOGIC';
//   valueType: 'NUMBER' | 'STRING' | 'DATE';
//   questionId?: string;
//   sampleValue?: number | string;
//   fixedValue?: number | string;
//   title?: string;
// }

// export interface StringToken extends BaseToken {
//   type: 'STRING';
//   value: string;
// }

// export type CostFormulaToken = SymbolToken | VariableToken | StringToken;

// export type Question = {
//   id: string;
//   questionText: string;
//   type?: string; // we only check for 'DATE' in buildFormulaExpression
// };

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
  IF: 'IF',
  ',': ',',
  TODAY: 'TODAY',
  DATEDIFF_MONTHS: 'DATEDIFF_MONTHS',
};

/* ================== UTIL ================== */

export function diffMonths(from: number, to: number): number {
  const start = new Date(from);
  const end = new Date(to);

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/* ================== TYPE GUARDS ================== */

function isSymbolToken(t: CostFormulaToken | undefined): t is SymbolToken {
  return !!t && (t as any).type === 'SYMBOL';
}
function isVariableToken(t: CostFormulaToken | undefined): t is VariableToken {
  return !!t && (t as any).type === 'VARIABLE';
}
function isStringToken(t: CostFormulaToken | undefined): t is StringToken {
  return !!t && (t as any).type === 'STRING';
}

/* ================== EVALUATOR ================== */

export const evaluateFormula = (tokens: CostFormulaToken[]): number | null => {
  try {
    const stack: (number | string)[] = [];

    /* -------------------------------- helpers -------------------------------- */

    const findClosingParen = (startIdx: number): number => {
      let depth = 0;
      for (let j = startIdx; j < tokens.length; j++) {
        const tk = tokens[j];
        if (isSymbolToken(tk) && tk.symbol === '(') {
          depth++;
        }
        if (isSymbolToken(tk) && tk.symbol === ')') {
          depth--;
          if (depth === 0) {
            return j;
          }
        }
      }
      return -1;
    };

    const isMathOperator = (t: CostFormulaToken | undefined) =>
      isSymbolToken(t) && ['+', '-', '*', '/'].includes(t.symbol);

    const comparisonOperators: SymbolValue[] = ['==', '>', '<', '>=', '<='];

    const shouldInsertImplicitPlus = (prev: unknown, next: CostFormulaToken | undefined) =>
      typeof prev === 'number' && !isMathOperator(next);

    /* ---------------------------- slice evaluation ---------------------------- */

    const evalSlice = (slice: CostFormulaToken[]): number => innerEval(slice);

    const innerEval = (sliceTokens: CostFormulaToken[]): number => {
      const parts: (number | string)[] = [];
      let k = 0;

      while (k < sliceTokens.length) {
        const tk = sliceTokens[k];

        // nested parentheses
        if (isSymbolToken(tk) && tk.symbol === '(') {
          let depth = 0;
          let closeIdx = -1;
          for (let j = k; j < sliceTokens.length; j++) {
            const s = sliceTokens[j];
            if (isSymbolToken(s) && s.symbol === '(') {
              depth++;
            }
            if (isSymbolToken(s) && s.symbol === ')') {
              depth--;
              if (depth === 0) {
                closeIdx = j;
                break;
              }
            }
          }
          if (closeIdx === -1) {
            k++;
            continue;
          }
          const inner = sliceTokens.slice(k + 1, closeIdx);
          parts.push(evalSlice(inner));
          k = closeIdx + 1;
          continue;
        }

        // DATEDIFF_MONTHS
        if (isSymbolToken(tk) && tk.symbol === 'DATEDIFF_MONTHS') {
          k++; // may point to '('
          let nextToken = sliceTokens[k];
          if (isSymbolToken(nextToken) && nextToken.symbol === '(') {
            k++;
          }
          const A = sliceTokens[k++];
          nextToken = sliceTokens[k];
          if (isSymbolToken(nextToken) && nextToken.symbol === ',') {
            k++;
          }
          const B = sliceTokens[k++];
          nextToken = sliceTokens[k];
          if (isSymbolToken(nextToken) && nextToken.symbol === ')') {
            k++;
          }

          const aVal =
            isSymbolToken(A) && A.symbol === 'TODAY'
              ? Date.now()
              : isVariableToken(A)
                ? (A.sampleValue ?? 0)
                : 0;
          const bVal =
            isSymbolToken(B) && B.symbol === 'TODAY'
              ? Date.now()
              : isVariableToken(B)
                ? (B.sampleValue ?? 0)
                : 0;

          parts.push(diffMonths(bVal as number, aVal as number));
          continue;
        }

        if (isVariableToken(tk)) {
          const v = tk.source === 'FIXED' ? (tk.fixedValue ?? 0) : (tk.sampleValue ?? 0);
          parts.push(tk.role === 'LOGIC' ? 0 : typeof v === 'string' ? Number(v) || 0 : v);
          k++;
          continue;
        }

        if (isSymbolToken(tk) && ['+', '-', '*', '/'].includes(tk.symbol)) {
          parts.push(tk.symbol);
          k++;
          continue;
        }

        if (isStringToken(tk)) {
          // strings only matter inside IF comparisons
          k++;
          continue;
        }

        k++;
      }

      return evalParts(sanitizeParts(parts));
    };

    /* ----------------- helper to evaluate a slice for comparisons ------------- */
    // returns raw value (string|number) if the slice is a single variable or symbol TODAY,
    // otherwise returns numeric value via evalSlice
    const evalComparison = (slice: CostFormulaToken[]): number | string => {
      if (!slice || slice.length === 0) {
        return 0;
      }

      // single SYMBOL TODAY
      if (slice.length === 1 && isSymbolToken(slice[0]) && slice[0].symbol === 'TODAY') {
        return Date.now();
      }

      // single VARIABLE — return raw sampleValue / fixedValue (so string comparisons work)
      if (slice.length === 1 && isVariableToken(slice[0])) {
        const v = slice[0];
        const raw =
          v.source === 'FIXED'
            ? (v.fixedValue ?? v.sampleValue ?? 0)
            : (v.sampleValue ?? v.fixedValue ?? 0);
        return raw as number | string;
      }

      // fallback to full numeric evaluation
      return evalSlice(slice);
    };

    /* ------------------------ sanitize + math engine -------------------------- */

    const sanitizeParts = (parts: (number | string)[]) => {
      const out: (number | string)[] = [];
      const isOp = (x: unknown) => typeof x === 'string' && ['+', '-', '*', '/'].includes(x);

      for (const p of parts) {
        if (typeof p === 'number') {
          if (typeof out[out.length - 1] === 'number') {
            out.push('+');
          }
          out.push(p);
          continue;
        }

        if (isOp(p)) {
          if (out.length === 0 || isOp(out[out.length - 1])) {
            // replace previous operator or initialize
            out[out.length - 1] = p as string;
          } else {
            out.push(p);
          }
        }
      }

      if (isOp(out[out.length - 1])) {
        out.pop();
      }
      return out;
    };

    const evalParts = (parts: (number | string)[]) => {
      if (!parts.length) {
        return 0;
      }

      // * /
      const pass1: (number | string)[] = [];
      let i = 0;
      while (i < parts.length) {
        if (parts[i] === '*' || parts[i] === '/') {
          const prev = Number(pass1.pop() ?? 0);
          const next = Number(parts[i + 1] ?? 0);
          pass1.push(parts[i] === '*' ? prev * next : next === 0 ? 0 : prev / next);
          i += 2;
        } else {
          pass1.push(parts[i++]);
        }
      }

      // + -
      let total = Number(pass1[0] ?? 0);
      for (let j = 1; j < pass1.length; j += 2) {
        const op = pass1[j];
        const num = Number(pass1[j + 1] ?? 0);
        if (op === '+') {
          total += num;
        }
        if (op === '-') {
          total -= num;
        }
      }

      return total;
    };

    /* ------------------------------- main loop -------------------------------- */

    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];

      // GROUP ()
      if (isSymbolToken(t) && t.symbol === '(') {
        const closeIdx = findClosingParen(i);
        if (closeIdx === -1) {
          i++;
          continue;
        }
        const val = evalSlice(tokens.slice(i + 1, closeIdx));
        const prev = stack[stack.length - 1];
        const next = tokens[closeIdx + 1];

        if (shouldInsertImplicitPlus(prev, next)) {
          stack.push('+');
        }
        stack.push(val);

        i = closeIdx + 1;
        continue;
      }

      // IF(...)
      if (isSymbolToken(t) && t.symbol === 'IF') {
        // expect '(' immediately after IF
        const openIdx = i + 1;
        if (!isSymbolToken(tokens[openIdx]) || tokens[openIdx].symbol !== '(') {
          console.warn('IF without opening "("', tokens[openIdx]);
          i++;
          continue;
        }

        const closeIdx = findClosingParen(openIdx);
        if (closeIdx === -1) {
          console.warn('Unclosed IF parentheses', tokens.slice(openIdx));
          i += 2;
          continue;
        }

        // find operator index at depth 0 inside IF body
        let depth = 0;
        let operatorIdx = -1;
        for (let j = openIdx + 1; j < closeIdx; j++) {
          const tk = tokens[j];
          if (isSymbolToken(tk) && tk.symbol === '(') {
            depth++;
          }
          if (isSymbolToken(tk) && tk.symbol === ')') {
            depth--;
          }
          if (depth === 0 && isSymbolToken(tk) && comparisonOperators.includes(tk.symbol)) {
            operatorIdx = j;
            break;
          }
        }

        if (operatorIdx === -1) {
          console.warn(
            'No comparison operator found inside IF',
            tokens.slice(openIdx, closeIdx + 1)
          );
          i = closeIdx + 1;
          continue;
        }

        // find the two commas (depth 0) separating true/false values
        let comma1 = -1;
        let comma2 = -1;
        depth = 0;
        for (let j = operatorIdx + 1; j < closeIdx; j++) {
          const tk = tokens[j];
          if (isSymbolToken(tk) && tk.symbol === '(') {
            depth++;
          }
          if (isSymbolToken(tk) && tk.symbol === ')') {
            depth--;
          }
          if (depth === 0 && isSymbolToken(tk) && tk.symbol === ',') {
            if (comma1 === -1) {
              comma1 = j;
            } else {
              comma2 = j;
              break;
            }
          }
        }

        if (comma1 === -1 || comma2 === -1) {
          console.warn(
            'Malformed IF: missing commas for true/false values',
            tokens.slice(openIdx, closeIdx + 1)
          );
          i = closeIdx + 1;
          continue;
        }

        const leftSlice = tokens.slice(openIdx + 1, operatorIdx);
        const rightSlice = tokens.slice(operatorIdx + 1, comma1);
        const trueSlice = tokens.slice(comma1 + 1, comma2);
        const falseSlice = tokens.slice(comma2 + 1, closeIdx);

        const leftVal = evalComparison(leftSlice);
        const rightVal = evalComparison(rightSlice);
        const trueVal = evalSlice(trueSlice);
        const falseVal = evalSlice(falseSlice);

        const operator = (tokens[operatorIdx] as SymbolToken).symbol;
        let cond = false;
        if (operator === '==') {
          cond = String(leftVal) === String(rightVal);
        } else if (operator === '>') {
          cond = Number(leftVal) > Number(rightVal);
        } else if (operator === '<') {
          cond = Number(leftVal) < Number(rightVal);
        } else if (operator === '>=') {
          cond = Number(leftVal) >= Number(rightVal);
        } else if (operator === '<=') {
          cond = Number(leftVal) <= Number(rightVal);
        } else {
          console.warn('Unknown IF operator', operator);
        }

        const resolved = cond ? trueVal : falseVal;
        const prev = stack[stack.length - 1];
        const next = tokens[closeIdx + 1];
        if (shouldInsertImplicitPlus(prev, next)) {
          stack.push('+');
        }
        stack.push(resolved);

        i = closeIdx + 1;
        continue;
      }

      // VARIABLE
      if (isVariableToken(t)) {
        const v = t.source === 'FIXED' ? (t.fixedValue ?? 0) : (t.sampleValue ?? 0);
        stack.push(t.role === 'LOGIC' ? 0 : typeof v === 'string' ? Number(v) || 0 : v);
        i++;
        continue;
      }

      // OPERATORS
      if (isMathOperator(t) && isSymbolToken(t)) {
        stack.push(t.symbol);
        i++;
        continue;
      }

      // STRING tokens are skipped in main loop (only used in IF comparisons)
      if (isStringToken(t)) {
        i++;
        continue;
      }

      i++;
    }

    /* -------------------------------- result ---------------------------------- */

    const finalParts = sanitizeParts(stack);
    const result = evalParts(finalParts);
    const rounded = Math.ceil(result / 1000) * 1000;

    // console.log('evaluateFormula →', finalParts.join(' '), result);
    return Number.isFinite(rounded) ? rounded : null;
  } catch (e) {
    // console.error('evaluateFormula error', e);
    return null;
  }
};

/* =================== BREAKDOWN & EXPRESSION =================== */

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
      result.push({ label: group, value });
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
