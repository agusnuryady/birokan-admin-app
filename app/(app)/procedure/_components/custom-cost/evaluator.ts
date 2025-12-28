// components/custom-cost/evaluator.ts

import {
  CompareOperator,
  CostFormulaToken,
  MathOperator,
  SymbolToken,
  VariableToken,
} from './types';

/* ================== HELPERS ================== */

const isMathOp = (v: unknown): v is MathOperator =>
  v === '+' || v === '-' || v === '*' || v === '/';

// const isCompareOp = (v: unknown): v is CompareOperator =>
//   v === '==' || v === '>' || v === '<' || v === '>=' || v === '<=';

const roundCost = (value: number): number => Math.ceil(value / 1000) * 1000;

/* ================== DATE ================== */

export function diffMonths(from: number, to: number): number {
  const start = new Date(from);
  const end = new Date(to);

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/* ================== VALUE RESOLVER ================== */

type EvalValue = number | string;

const resolveValue = (token: any): EvalValue => {
  if (token.type === 'STRING') {
    return token.value;
  }

  if (token.type === 'VARIABLE') {
    if (token.valueType === 'STRING') {
      return token.sampleValue ?? token.fixedValue ?? '';
    }
    return token.sampleValue ?? token.fixedValue ?? 0;
  }

  if (token.type === 'SYMBOL' && token.symbol === 'TODAY') {
    return Date.now();
  }

  return 0;
};

/* ================== CONDITION ================== */

function evaluateCondition(
  left: number | string,
  operator: CompareOperator,
  right: number | string
): boolean {
  // string comparison (case-insensitive)
  if (typeof left === 'string' || typeof right === 'string') {
    if (operator !== '==') {
      return false;
    }
    return String(left).toLowerCase() === String(right).toLowerCase();
  }

  // numeric comparison
  switch (operator) {
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '==':
      return left === right;
    default:
      return false;
  }
}

/* ================== MATH ENGINE ================== */

function evaluateMath(parts: Array<number | MathOperator>): number {
  if (parts.length === 0) {
    return 0;
  }

  // pass 1: * /
  const stack: Array<number | MathOperator> = [];
  let i = 0;

  while (i < parts.length) {
    const token = parts[i];

    if (token === '*' || token === '/') {
      const prev = Number(stack.pop() ?? 0);
      const next = Number(parts[i + 1] ?? 0);
      stack.push(token === '*' ? prev * next : next === 0 ? 0 : prev / next);
      i += 2;
    } else {
      stack.push(token);
      i++;
    }
  }

  // pass 2: + -
  let total = Number(stack[0] ?? 0);
  let j = 1;

  while (j < stack.length) {
    const op = stack[j] as MathOperator;
    const num = Number(stack[j + 1] ?? 0);

    if (op === '+') {
      total += num;
    }
    if (op === '-') {
      total -= num;
    }

    j += 2;
  }

  return Number.isFinite(total) ? total : 0;
}

/* ================== CORE EVALUATOR ================== */

export function evaluateFormulaTokens(tokens: CostFormulaToken[]): number | null {
  try {
    let idx = 0;

    const evalSlice = (slice: CostFormulaToken[]): number => {
      const parts: Array<number | MathOperator> = [];
      let k = 0;

      while (k < slice.length) {
        const t = slice[k];

        // ---------- Parentheses ----------
        if (t.type === 'SYMBOL' && (t as SymbolToken).symbol === '(') {
          let depth = 1;
          let end = k + 1;

          while (end < slice.length && depth > 0) {
            if (slice[end].type === 'SYMBOL') {
              const sym = (slice[end] as SymbolToken).symbol;
              if (sym === '(') {
                depth++;
              }
              if (sym === ')') {
                depth--;
              }
            }
            end++;
          }

          const inner = slice.slice(k + 1, end - 1);
          parts.push(evalSlice(inner));
          k = end;
          continue;
        }

        // ---------- VARIABLE ----------
        if (t.type === 'VARIABLE') {
          const val = resolveValue(t);
          parts.push(typeof val === 'number' ? val : 0);
          k++;
          continue;
        }

        // ---------- OPERATOR ----------
        if (t.type === 'SYMBOL' && isMathOp(t.symbol)) {
          parts.push(t.symbol);
          k++;
          continue;
        }

        k++;
      }

      return evaluateMath(parts);
    };

    /* ---------- TOP LEVEL ---------- */

    const stack: Array<number | MathOperator> = [];

    while (idx < tokens.length) {
      const t = tokens[idx];

      // ---------- IF ----------
      if (t.type === 'SYMBOL' && t.symbol === 'IF') {
        idx += 2; // skip IF (

        const leftTok = tokens[idx++] as VariableToken;
        const op = (tokens[idx++] as SymbolToken).symbol as CompareOperator;
        const rightTok = tokens[idx++] as VariableToken;

        idx++; // skip ,

        const trueExpr: CostFormulaToken[] = [];
        let depth = 0;

        while (idx < tokens.length) {
          const cur = tokens[idx];
          if (cur.type === 'SYMBOL' && cur.symbol === '(') {
            depth++;
          }
          if (cur.type === 'SYMBOL' && cur.symbol === ')') {
            if (depth === 0) {
              break;
            }
            depth--;
          }
          if (cur.type === 'SYMBOL' && cur.symbol === ',' && depth === 0) {
            break;
          }
          trueExpr.push(cur);
          idx++;
        }

        idx++; // skip ,

        const falseExpr: CostFormulaToken[] = [];
        while (
          idx < tokens.length &&
          (tokens[idx].type !== 'SYMBOL' || (tokens[idx] as SymbolToken).symbol !== ')')
        ) {
          falseExpr.push(tokens[idx]);
          idx++;
        }

        idx++; // skip )

        const left = resolveValue(leftTok);
        const right = resolveValue(rightTok);

        const condition = evaluateCondition(left, op, right);
        const result = condition ? evalSlice(trueExpr) : evalSlice(falseExpr);

        stack.push(result);
        continue;
      }

      // ---------- VARIABLE ----------
      if (t.type === 'VARIABLE') {
        const val = resolveValue(t);
        stack.push(typeof val === 'number' ? val : 0);
        idx++;
        continue;
      }

      // ---------- OPERATOR ----------
      if (t.type === 'SYMBOL' && isMathOp(t.symbol)) {
        stack.push(t.symbol);
        idx++;
        continue;
      }

      idx++;
    }

    const result = evaluateMath(stack);
    return roundCost(result);
  } catch {
    return null;
  }
}
