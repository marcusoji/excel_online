import type { GridData } from "@/types";
import { expandRange, isValidCellId } from "@/lib/cellUtils";

/**
 * A small, dependency-free formula engine.
 *
 * It only needs to support what the curriculum actually teaches
 * (arithmetic, SUM/AVERAGE/MAX/MIN/COUNT, and a simple IF), so it trades
 * completeness for something we can fully understand, test, and keep
 * bundle-size-free of a full formula library.
 */

export type CellValue = number | string | boolean;

class FormulaError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type TokenType =
  | "number"
  | "string"
  | "ident" // function name or cell ref
  | "op"
  | "lparen"
  | "rparen"
  | "comma"
  | "colon"
  | "eof";

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i] as string;

    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", value: ch });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ch });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma", value: ch });
      i++;
      continue;
    }
    if (ch === ":") {
      tokens.push({ type: "colon", value: ch });
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let str = "";
      while (j < n && input[j] !== '"') {
        str += input[j];
        j++;
      }
      tokens.push({ type: "string", value: str });
      i = j + 1;
      continue;
    }
    // Two-character operators first: <=, >=, <>
    const two = input.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>") {
      tokens.push({ type: "op", value: two });
      i += 2;
      continue;
    }
    if ("+-*/=<>^&".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      let numStr = "";
      while (j < n && /[0-9.]/.test(input[j] as string)) {
        numStr += input[j];
        j++;
      }
      tokens.push({ type: "number", value: numStr });
      i = j;
      continue;
    }
    if (/[A-Za-z$]/.test(ch)) {
      let j = i;
      let ident = "";
      while (j < n && /[A-Za-z0-9$]/.test(input[j] as string)) {
        ident += input[j];
        j++;
      }
      tokens.push({ type: "ident", value: ident.replace(/\$/g, "") });
      i = j;
      continue;
    }

    throw new FormulaError("#ERROR!");
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

type Node =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "ref"; cell: string }
  | { kind: "range"; start: string; end: string }
  | { kind: "binary"; op: string; left: Node; right: Node }
  | { kind: "unary"; op: string; value: Node }
  | { kind: "call"; name: string; args: Node[] };

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos] as Token;
  }

  private next(): Token {
    const t = this.tokens[this.pos] as Token;
    this.pos++;
    return t;
  }

  private expect(type: TokenType): Token {
    const t = this.next();
    if (t.type !== type) throw new FormulaError("#ERROR!");
    return t;
  }

  parseExpression(): Node {
    const node = this.parseComparison();
    if (this.peek().type !== "eof") throw new FormulaError("#ERROR!");
    return node;
  }

  // Used when parsing a single function argument, which may be a range.
  parseArg(): Node {
    // Lookahead for CELLREF : CELLREF pattern.
    if (this.peek().type === "ident" && isValidCellId(this.peek().value)) {
      const save = this.pos;
      const first = this.next().value;
      if (this.peek().type === "colon") {
        this.next();
        const secondTok = this.next();
        if (secondTok.type === "ident" && isValidCellId(secondTok.value)) {
          return { kind: "range", start: first.toUpperCase(), end: secondTok.value.toUpperCase() };
        }
        // Not actually a range, rewind.
        this.pos = save;
      } else {
        this.pos = save;
      }
    }
    return this.parseComparison();
  }

  private parseComparison(): Node {
    let left = this.parseAdditive();
    const t = this.peek();
    if (t.type === "op" && ["=", "<>", "<", ">", "<=", ">="].includes(t.value)) {
      const op = this.next().value;
      const right = this.parseAdditive();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseAdditive(): Node {
    let left = this.parseTerm();
    while (this.peek().type === "op" && (this.peek().value === "+" || this.peek().value === "-")) {
      const op = this.next().value;
      const right = this.parseTerm();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseTerm(): Node {
    let left = this.parseFactor();
    while (this.peek().type === "op" && (this.peek().value === "*" || this.peek().value === "/")) {
      const op = this.next().value;
      const right = this.parseFactor();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseFactor(): Node {
    const t = this.peek();
    if (t.type === "op" && t.value === "-") {
      this.next();
      return { kind: "unary", op: "-", value: this.parseFactor() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Node {
    const t = this.next();
    if (t.type === "number") return { kind: "number", value: parseFloat(t.value) };
    if (t.type === "string") return { kind: "string", value: t.value };
    if (t.type === "lparen") {
      const inner = this.parseComparison();
      this.expect("rparen");
      return inner;
    }
    if (t.type === "ident") {
      // Function call?
      if (this.peek().type === "lparen") {
        this.next(); // consume (
        const args: Node[] = [];
        if (this.peek().type !== "rparen") {
          args.push(this.parseArg());
          while (this.peek().type === "comma") {
            this.next();
            args.push(this.parseArg());
          }
        }
        this.expect("rparen");
        return { kind: "call", name: t.value.toUpperCase(), args };
      }
      // Cell reference or bare word (TRUE/FALSE).
      if (isValidCellId(t.value)) {
        return { kind: "ref", cell: t.value.toUpperCase() };
      }
      if (t.value.toUpperCase() === "TRUE") return { kind: "number", value: 1 };
      if (t.value.toUpperCase() === "FALSE") return { kind: "number", value: 0 };
      return { kind: "string", value: t.value };
    }
    throw new FormulaError("#ERROR!");
  }
}

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

interface EvalContext {
  grid: GridData;
  visiting: Set<string>;
  namedRanges?: Record<string, string>;
}

function toNumber(value: CellValue): number {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

function isNumericValue(value: CellValue): boolean {
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  return value.trim() !== "" && !Number.isNaN(Number(value));
}

/** Replaces whole-word named-range aliases (e.g. "Sales") with their literal range text before parsing. */
function substituteNamedRanges(formulaBody: string, namedRanges?: Record<string, string>): string {
  if (!namedRanges) return formulaBody;
  let result = formulaBody;
  for (const [name, range] of Object.entries(namedRanges)) {
    result = result.replace(new RegExp(`\\b${name}\\b`, "gi"), range);
  }
  return result;
}

function looseEquals(a: CellValue, b: CellValue): boolean {
  if (typeof a === "number" || typeof b === "number") {
    const an = isNumericValue(a) ? toNumber(a) : NaN;
    const bn = isNumericValue(b) ? toNumber(b) : NaN;
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an === bn;
  }
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function flattenRangeToValues(start: string, end: string, ctx: EvalContext): CellValue[] {
  return expandRange(start, end).map((cellId) => evaluateCellInternal(cellId, ctx));
}

function evalNode(node: Node, ctx: EvalContext): CellValue {
  switch (node.kind) {
    case "number":
      return node.value;
    case "string":
      return node.value;
    case "ref":
      return evaluateCellInternal(node.cell, ctx);
    case "range":
      // A bare range outside of a function (e.g. "=A1:A3") — sum it, which
      // matches how a beginner would expect a highlighted range to behave.
      return flattenRangeToValues(node.start, node.end, ctx)
        .filter(isNumericValue)
        .reduce((acc: number, v) => acc + toNumber(v), 0);
    case "unary": {
      const v = toNumber(evalNode(node.value, ctx));
      return node.op === "-" ? -v : v;
    }
    case "binary": {
      const left = evalNode(node.left, ctx);
      const right = evalNode(node.right, ctx);
      switch (node.op) {
        case "+":
          return toNumber(left) + toNumber(right);
        case "-":
          return toNumber(left) - toNumber(right);
        case "*":
          return toNumber(left) * toNumber(right);
        case "/": {
          const denom = toNumber(right);
          if (denom === 0) throw new FormulaError("#DIV/0!");
          return toNumber(left) / denom;
        }
        case "=":
          return looseEquals(left, right);
        case "<>":
          return !looseEquals(left, right);
        case "<":
          return toNumber(left) < toNumber(right);
        case ">":
          return toNumber(left) > toNumber(right);
        case "<=":
          return toNumber(left) <= toNumber(right);
        case ">=":
          return toNumber(left) >= toNumber(right);
        default:
          throw new FormulaError("#ERROR!");
      }
    }
    case "call":
      return evalCall(node, ctx);
  }
}

function argsToNumbers(args: Node[], ctx: EvalContext): number[] {
  const values: CellValue[] = [];
  for (const arg of args) {
    if (arg.kind === "range") {
      values.push(...flattenRangeToValues(arg.start, arg.end, ctx));
    } else {
      values.push(evalNode(arg, ctx));
    }
  }
  return values.filter(isNumericValue).map(toNumber);
}

function matchesCriteria(value: CellValue, criteria: CellValue): boolean {
  const critStr = String(criteria).trim();
  const comparisonMatch = /^(<=|>=|<>|<|>)(.+)$/.exec(critStr);
  if (comparisonMatch) {
    const [, op, rest] = comparisonMatch;
    const num = toNumber(value);
    const target = parseFloat(rest ?? "0");
    switch (op) {
      case "<":
        return num < target;
      case ">":
        return num > target;
      case "<=":
        return num <= target;
      case ">=":
        return num >= target;
      case "<>":
        return num !== target;
    }
  }
  if (isNumericValue(value) && isNumericValue(criteria)) {
    return toNumber(value) === toNumber(criteria);
  }
  return looseEquals(value, criteria);
}

function requireString(args: Node[], index: number, ctx: EvalContext): string {
  const arg = args[index];
  if (!arg) throw new FormulaError("#ERROR!");
  return String(evalNode(arg, ctx));
}

function evalCall(node: { name: string; args: Node[] }, ctx: EvalContext): CellValue {
  const { name, args } = node;
  switch (name) {
    case "SUM":
      return argsToNumbers(args, ctx).reduce((a, b) => a + b, 0);
    case "AVERAGE": {
      const nums = argsToNumbers(args, ctx);
      if (nums.length === 0) throw new FormulaError("#DIV/0!");
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    case "MAX": {
      const nums = argsToNumbers(args, ctx);
      return nums.length ? Math.max(...nums) : 0;
    }
    case "MIN": {
      const nums = argsToNumbers(args, ctx);
      return nums.length ? Math.min(...nums) : 0;
    }
    case "COUNT":
      return argsToNumbers(args, ctx).length;
    case "COUNTIF": {
      const [rangeArg, criteriaArg] = args;
      if (!rangeArg || rangeArg.kind !== "range" || !criteriaArg) throw new FormulaError("#ERROR!");
      const criteria = evalNode(criteriaArg, ctx);
      const values = flattenRangeToValues(rangeArg.start, rangeArg.end, ctx);
      return values.filter((v) => matchesCriteria(v, criteria)).length;
    }
    case "SUMIF": {
      const [rangeArg, criteriaArg, sumRangeArg] = args;
      if (!rangeArg || rangeArg.kind !== "range" || !criteriaArg) throw new FormulaError("#ERROR!");
      const criteria = evalNode(criteriaArg, ctx);
      const testValues = flattenRangeToValues(rangeArg.start, rangeArg.end, ctx);
      const sumValues =
        sumRangeArg && sumRangeArg.kind === "range" ? flattenRangeToValues(sumRangeArg.start, sumRangeArg.end, ctx) : testValues;
      let total = 0;
      testValues.forEach((v, idx) => {
        if (matchesCriteria(v, criteria)) total += toNumber(sumValues[idx] ?? 0);
      });
      return total;
    }
    case "IF": {
      const [condArg, thenArg, elseArg] = args;
      if (!condArg) throw new FormulaError("#ERROR!");
      const cond = evalNode(condArg, ctx);
      const truthy = typeof cond === "boolean" ? cond : toNumber(cond) !== 0;
      if (truthy) return thenArg ? evalNode(thenArg, ctx) : true;
      return elseArg ? evalNode(elseArg, ctx) : false;
    }
    case "ROUND": {
      const [valArg, digitsArg] = args;
      if (!valArg) throw new FormulaError("#ERROR!");
      const val = toNumber(evalNode(valArg, ctx));
      const digits = digitsArg ? toNumber(evalNode(digitsArg, ctx)) : 0;
      const factor = Math.pow(10, digits);
      return Math.round(val * factor) / factor;
    }
    case "XLOOKUP": {
      const [lookupArg, lookupRangeArg, returnRangeArg] = args;
      if (!lookupArg || !lookupRangeArg || lookupRangeArg.kind !== "range" || !returnRangeArg || returnRangeArg.kind !== "range") {
        throw new FormulaError("#ERROR!");
      }
      const lookupValue = evalNode(lookupArg, ctx);
      const lookupCells = expandRange(lookupRangeArg.start, lookupRangeArg.end);
      const returnCells = expandRange(returnRangeArg.start, returnRangeArg.end);
      for (let i = 0; i < lookupCells.length; i++) {
        const candidateCell = lookupCells[i];
        if (!candidateCell) continue;
        const candidateValue = evaluateCellInternal(candidateCell, ctx);
        if (looseEquals(candidateValue, lookupValue)) {
          const returnCell = returnCells[i];
          return returnCell ? evaluateCellInternal(returnCell, ctx) : "#N/A";
        }
      }
      return "#N/A";
    }
    case "TRIM":
      return requireString(args, 0, ctx).trim().replace(/\s+/g, " ");
    case "UPPER":
      return requireString(args, 0, ctx).toUpperCase();
    case "LOWER":
      return requireString(args, 0, ctx).toLowerCase();
    case "PROPER":
      return requireString(args, 0, ctx).replace(/\w\S*/g, (word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase());
    case "LEN":
      return requireString(args, 0, ctx).length;
    case "CONCAT":
    case "CONCATENATE":
      return args.map((a) => String(evalNode(a, ctx))).join("");
    case "LEFT": {
      const s = requireString(args, 0, ctx);
      const n = args[1] ? toNumber(evalNode(args[1], ctx)) : 1;
      return s.slice(0, n);
    }
    case "RIGHT": {
      const s = requireString(args, 0, ctx);
      const n = args[1] ? toNumber(evalNode(args[1], ctx)) : 1;
      return s.slice(Math.max(0, s.length - n));
    }
    case "MID": {
      const s = requireString(args, 0, ctx);
      const start = args[1] ? toNumber(evalNode(args[1], ctx)) : 1;
      const count = args[2] ? toNumber(evalNode(args[2], ctx)) : 0;
      return s.slice(Math.max(0, start - 1), Math.max(0, start - 1) + count);
    }
    case "SORT": {
      const [rangeArg, orderArg] = args;
      if (!rangeArg || rangeArg.kind !== "range") throw new FormulaError("#ERROR!");
      const values = flattenRangeToValues(rangeArg.start, rangeArg.end, ctx).filter(isNumericValue).map(toNumber);
      const order = orderArg ? toNumber(evalNode(orderArg, ctx)) : 1;
      const sorted = [...values].sort((a, b) => (order < 0 ? b - a : a - b));
      // A real dynamic array would spill this whole list into neighboring cells;
      // this engine models one formula → one cell, so we surface just the first
      // value here and show the full spill in a dedicated preview panel instead.
      return sorted[0] ?? 0;
    }
    default:
      throw new FormulaError("#NAME?");
  }
}

function evaluateCellInternal(cellId: string, ctx: EvalContext): CellValue {
  if (ctx.visiting.has(cellId)) return "#CIRCULAR!";
  const cell = ctx.grid[cellId];
  const raw = cell?.raw ?? "";
  if (raw === "") return "";

  if (raw.startsWith("=")) {
    ctx.visiting.add(cellId);
    try {
      const substituted = substituteNamedRanges(raw.slice(1), ctx.namedRanges);
      const tokens = tokenize(substituted);
      const ast = new Parser(tokens).parseExpression();
      return evalNode(ast, ctx);
    } catch (err) {
      if (err instanceof FormulaError) return err.code;
      return "#ERROR!";
    } finally {
      ctx.visiting.delete(cellId);
    }
  }

  // Plain literal: number if it looks like one, otherwise text.
  if (raw.trim() !== "" && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

/** Public entry point: evaluate a cell's displayable value. */
export function evaluateCell(cellId: string, grid: GridData, namedRanges?: Record<string, string>): CellValue {
  return evaluateCellInternal(cellId, { grid, visiting: new Set(), namedRanges });
}

/** Format a CellValue the way a beginner-friendly grid should display it. */
export function formatCellValue(value: CellValue): string {
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toString();
    return Math.round(value * 100) / 100 + "";
  }
  return value;
}

export function isFormula(raw: string): boolean {
  return raw.trim().startsWith("=");
}
