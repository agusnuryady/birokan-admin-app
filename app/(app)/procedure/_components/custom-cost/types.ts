// components/custom-cost/types.ts

export type TokenId = string;

/* ---------- VARIABLE ---------- */

export type VariableRole = 'MONEY' | 'LOGIC' | 'STRING';

export type VariableSource = 'QUESTION' | 'FIXED';

/* ---------- SYMBOL ---------- */

export type MathOperator = '+' | '-' | '*' | '/';
export type CompareOperator = '==' | '>' | '<' | '>=' | '<=';
export type SpecialSymbol = 'IF' | ',' | '(' | ')' | 'TODAY' | 'DATEDIFF_MONTHS';

export type SymbolValue =
  | '+'
  | '-'
  | '*'
  | '/'
  | '('
  | ')'
  | '>'
  | '<'
  | '>='
  | '<='
  | '=='
  | 'IF'
  | ','
  | 'TODAY'
  | 'DATEDIFF_MONTHS';

interface BaseToken {
  id: string;
  type: 'VARIABLE' | 'SYMBOL' | 'STRING';
  costGroup?: string;
}

export type ValueType = 'NUMBER' | 'STRING' | 'DATE';

export interface VariableToken extends BaseToken {
  type: 'VARIABLE';
  source: 'QUESTION' | 'FIXED';
  role: 'MONEY' | 'LOGIC';
  questionId?: string;
  valueType?: ValueType;
  fixedValue?: number | string;
  sampleValue?: number | string;
  title?: string;
}

export interface SymbolToken extends BaseToken {
  type: 'SYMBOL';
  symbol: SymbolValue;
}

export interface StringToken extends BaseToken {
  type: 'STRING';
  value: string;
}

/* ---------- UNION ---------- */

export type CostFormulaToken = VariableToken | SymbolToken | StringToken;

/* ---------- HELPERS ---------- */

export const isVariableToken = (t: CostFormulaToken): t is VariableToken => t.type === 'VARIABLE';

export const isSymbolToken = (t: CostFormulaToken): t is SymbolToken => t.type === 'SYMBOL';
