import { assume } from "@nanofuzz/runtime";

/**
 * Arithmetic Expression Evaluator and Grammar-Based Input Generator
 *
 * Grammar:
 *   Expr   -> Term (( '+' | '-' ) Term)*
 *   Term   -> Factor (( '*' | '/' ) Factor)*
 *   Factor -> Number | '(' Expr ')' | '-' Factor | '+' Factor
 */

/**
 * Parses and evaluates an arithmetic expression string following standard operator precedence.
 *
 * @param expr The arithmetic expression string to evaluate
 * @returns The numeric result of evaluating the expression
 */
export function evaluateExpression(expr: string): number {
  const tokens = tokenize(expr);
  let pos = 0;

  function peek(): string | undefined {
    return tokens[pos];
  } // fn: peek

  function consume(): string {
    const token = tokens[pos];
    pos++;
    return token;
  } // fn: consume

  function parseFactor(): number {
    const token = peek();
    if (!token) {
      throw new Error("Unexpected end of input while expecting factor");
    }

    if (token === "(") {
      consume(); // consume '('
      const val = parseExpr();
      if (peek() !== ")") {
        throw new Error(`Expected ')' but found '${peek() ?? "<end>"}'`);
      }
      consume(); // consume ')'
      return val;
    }

    if (token === "-") {
      consume(); // unary minus
      return -parseFactor();
    }

    if (token === "+") {
      consume(); // unary plus
      return parseFactor();
    }

    const num = Number(token);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid numeric token: '${token}'`);
    }
    consume();
    return num;
  } // fn: parseFactor

  function parseTerm(): number {
    let left = parseFactor();

    while (peek() === "*" || peek() === "/") {
      const op = consume();
      const right = parseFactor();
      if (op === "*") {
        left = left * right;
      } else {
        if (right === 0) {
          throw new Error("Division by zero in arithmetic expression");
        }
        left = left / right;
      }
    }

    return left;
  } // fn: parseTerm

  function parseExpr(): number {
    let left = parseTerm();

    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const right = parseTerm();
      if (op === "+") {
        left = left + right;
      } else {
        left = left - right;
      }
    }

    return left;
  } // fn: parseExpr

  const result = parseExpr();
  if (pos < tokens.length) {
    throw new Error(`Unexpected trailing tokens starting at '${tokens[pos]}'`);
  }

  return result;
} // fn: evaluateExpression

/**
 * User-provided input generator that produces syntactically valid arithmetic expression strings.
 *
 * @param prng Seeded pseudo-random number generator function returning [0, 1)
 * @returns Argument tuple for evaluateExpression or undefined when exhausted
 */
export function evaluateExpressionGenerator(
  prng: () => number,
): Parameters<typeof evaluateExpression> | undefined {
  const maxDepth = 4;
  const exprString = generateRandomExpr(prng, 0, maxDepth);
  return [exprString];
} // fn: evaluateExpressionGenerator

/**
 * Input transformer that skips syntactically-invalid expressions.
 *
 * @param expr The arithmetic expression candidate string
 * @returns Argument tuple for evaluateExpression
 */
export function evaluateExpressionTransformer(
  expr: string,
): Parameters<typeof evaluateExpression> {
  assume(isValidSyntax(expr), "Expression must be syntactically valid");
  return [expr];
} // fn: evaluateExpressionTransformer

// -------------------------------------------------------------------------- //
// Private Helper Functions (Grammar Generator, Lexer & Syntax Validator)
// -------------------------------------------------------------------------- //

function isValidSyntax(expr: string): boolean {
  const tokens = tokenizeSafe(expr);
  if (!tokens || tokens.length === 0) {
    return false;
  }
  const state = { pos: 0 };
  if (!checkExpr(tokens, state)) {
    return false;
  }
  return state.pos === tokens.length;
} // fn: isValidSyntax

function checkFactor(tokens: string[], state: { pos: number }): boolean {
  if (state.pos >= tokens.length) {
    return false;
  }
  const token = tokens[state.pos];
  if (token === "(") {
    state.pos++;
    if (!checkExpr(tokens, state)) {
      return false;
    }
    if (state.pos >= tokens.length || tokens[state.pos] !== ")") {
      return false;
    }
    state.pos++;
    return true;
  }
  if (token === "-" || token === "+") {
    state.pos++;
    return checkFactor(tokens, state);
  }
  const num = Number(token);
  if (!Number.isNaN(num)) {
    state.pos++;
    return true;
  }
  return false;
} // fn: checkFactor

function checkTerm(tokens: string[], state: { pos: number }): boolean {
  if (!checkFactor(tokens, state)) {
    return false;
  }
  while (
    state.pos < tokens.length &&
    (tokens[state.pos] === "*" || tokens[state.pos] === "/")
  ) {
    state.pos++;
    if (!checkFactor(tokens, state)) {
      return false;
    }
  }
  return true;
} // fn: checkTerm

function checkExpr(tokens: string[], state: { pos: number }): boolean {
  if (!checkTerm(tokens, state)) {
    return false;
  }
  while (
    state.pos < tokens.length &&
    (tokens[state.pos] === "+" || tokens[state.pos] === "-")
  ) {
    state.pos++;
    if (!checkTerm(tokens, state)) {
      return false;
    }
  }
  return true;
} // fn: checkExpr

function tokenizeSafe(input: string): string[] | null {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (
      ch === "+" ||
      ch === "-" ||
      ch === "*" ||
      ch === "/" ||
      ch === "(" ||
      ch === ")"
    ) {
      tokens.push(ch);
      i++;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(input[i + 1] ?? ""))) {
      let numStr = "";
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    return null;
  }

  return tokens;
} // fn: tokenizeSafe

function generateRandomExpr(
  prng: () => number,
  depth: number,
  maxDepth: number,
): string {
  const termCount = Math.floor(prng() * 3) + 1; // 1 to 3 terms
  const terms: string[] = [];
  const ops: string[] = [];

  for (let i = 0; i < termCount; i++) {
    terms.push(generateRandomTerm(prng, depth, maxDepth));
    if (i < termCount - 1) {
      ops.push(prng() < 0.5 ? " + " : " - ");
    }
  }

  let result = terms[0];
  for (let i = 0; i < ops.length; i++) {
    result += ops[i] + terms[i + 1];
  }
  return result;
} // fn: generateRandomExpr

function generateRandomTerm(
  prng: () => number,
  depth: number,
  maxDepth: number,
): string {
  const factorCount = Math.floor(prng() * 3) + 1; // 1 to 3 factors
  const factors: string[] = [];
  const ops: string[] = [];

  for (let i = 0; i < factorCount; i++) {
    factors.push(generateRandomFactor(prng, depth, maxDepth));
    if (i < factorCount - 1) {
      ops.push(prng() < 0.5 ? " * " : " / ");
    }
  }

  let result = factors[0];
  for (let i = 0; i < ops.length; i++) {
    result += ops[i] + factors[i + 1];
  }
  return result;
} // fn: generateRandomTerm

function generateRandomFactor(
  prng: () => number,
  depth: number,
  maxDepth: number,
): string {
  if (depth < maxDepth && prng() < 0.3) {
    const inner = generateRandomExpr(prng, depth + 1, maxDepth);
    return `(${inner})`;
  }

  const val = Math.floor(prng() * 100) + 1;
  return String(val);
} // fn: generateRandomFactor

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (
      ch === "+" ||
      ch === "-" ||
      ch === "*" ||
      ch === "/" ||
      ch === "(" ||
      ch === ")"
    ) {
      tokens.push(ch);
      i++;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(input[i + 1] ?? ""))) {
      let numStr = "";
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at index ${i}`);
  }

  return tokens;
} // fn: tokenize
