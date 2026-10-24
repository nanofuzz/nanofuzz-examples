from typing import Any, List, Optional, Tuple

from nanofuzz_runtime import assume


def evaluate_expression(expr: str) -> float:
    """Parses and evaluates an arithmetic expression string following standard operator precedence."""
    tokens = _tokenize(expr)
    pos = 0

    def peek() -> Optional[str]:
        nonlocal pos
        return tokens[pos] if pos < len(tokens) else None

    def consume() -> str:
        nonlocal pos
        token = tokens[pos]
        pos += 1
        return token

    def parse_factor() -> float:
        token = peek()
        if token is None:
            raise ValueError("Unexpected end of input while expecting factor")

        if token == "(":
            consume()  # '('
            val = parse_expr()
            if peek() != ")":
                raise ValueError(f"Expected ')' but found '{peek()}'")
            consume()  # ')'
            return val

        if token == "-":
            consume()
            return -parse_factor()

        if token == "+":
            consume()
            return parse_factor()

        try:
            val = float(token)
            consume()
            return val
        except ValueError:
            raise ValueError(f"Invalid numeric token: '{token}'")

    def parse_term() -> float:
        left = parse_factor()

        while peek() in ("*", "/"):
            op = consume()
            right = parse_factor()
            if op == "*":
                left = left * right
            else:
                if right == 0.0:
                    raise ZeroDivisionError(
                        "Division by zero in arithmetic expression")
                left = left / right

        return left

    def parse_expr() -> float:
        left = parse_term()

        while peek() in ("+", "-"):
            op = consume()
            right = parse_term()
            if op == "+":
                left = left + right
            else:
                left = left - right

        return left

    result = parse_expr()
    if pos < len(tokens):
        raise ValueError(
            f"Unexpected trailing tokens starting at '{tokens[pos]}'")

    return result


def evaluate_expression_generator(prng: Any) -> Optional[Tuple[str]]:
    """User-provided input generator producing syntactically valid arithmetic expression strings."""
    max_depth = 4
    expr_string = _generate_random_expr(prng, 0, max_depth)
    return (expr_string,)


def evaluate_expression_transformer(expr: str) -> Tuple[str]:
    """Input transformer that skips syntactically-invalid expressions."""
    assume(_is_valid_syntax(expr), "Expression must be syntactically valid")
    return (expr,)


# -------------------------------------------------------------------------- #
# Private Helper Functions (Grammar Generator, Lexer & Syntax Validator)
# -------------------------------------------------------------------------- #


def _is_valid_syntax(expr: str) -> bool:
    tokens = _tokenize_safe(expr)
    if not tokens:
        return False
    pos_ref = [0]
    if not _check_expr(tokens, pos_ref):
        return False
    return pos_ref[0] == len(tokens)


def _check_factor(tokens: List[str], pos_ref: List[int]) -> bool:
    if pos_ref[0] >= len(tokens):
        return False
    tok = tokens[pos_ref[0]]
    if tok == "(":
        pos_ref[0] += 1
        if not _check_expr(tokens, pos_ref):
            return False
        if pos_ref[0] >= len(tokens) or tokens[pos_ref[0]] != ")":
            return False
        pos_ref[0] += 1
        return True
    if tok in ("-", "+"):
        pos_ref[0] += 1
        return _check_factor(tokens, pos_ref)
    try:
        float(tok)
        pos_ref[0] += 1
        return True
    except ValueError:
        return False


def _check_term(tokens: List[str], pos_ref: List[int]) -> bool:
    if not _check_factor(tokens, pos_ref):
        return False
    while pos_ref[0] < len(tokens) and tokens[pos_ref[0]] in ("*", "/"):
        pos_ref[0] += 1
        if not _check_factor(tokens, pos_ref):
            return False
    return True


def _check_expr(tokens: List[str], pos_ref: List[int]) -> bool:
    if not _check_term(tokens, pos_ref):
        return False
    while pos_ref[0] < len(tokens) and tokens[pos_ref[0]] in ("+", "-"):
        pos_ref[0] += 1
        if not _check_term(tokens, pos_ref):
            return False
    return True


def _tokenize_safe(input_str: str) -> Optional[List[str]]:
    tokens: List[str] = []
    i = 0

    while i < len(input_str):
        ch = input_str[i]

        if ch.isspace():
            i += 1
            continue

        if ch in "+-*/()":
            tokens.append(ch)
            i += 1
            continue

        if ch.isdigit() or (ch == "." and i + 1 < len(input_str) and input_str[i + 1].isdigit()):
            num_str = ""
            while i < len(input_str) and (input_str[i].isdigit() or input_str[i] == "."):
                num_str += input_str[i]
                i += 1
            tokens.append(num_str)
            continue

        return None

    return tokens


def _generate_random_expr(prng: Any, depth: int, max_depth: int) -> str:
    term_count = int(prng() * 3) + 1
    terms = [_generate_random_term(prng, depth, max_depth)
             for _ in range(term_count)]
    ops = [" + " if prng() < 0.5 else " - " for _ in range(term_count - 1)]

    result = terms[0]
    for i in range(len(ops)):
        result += ops[i] + terms[i + 1]
    return result


def _generate_random_term(prng: Any, depth: int, max_depth: int) -> str:
    factor_count = int(prng() * 3) + 1
    factors = [_generate_random_factor(
        prng, depth, max_depth) for _ in range(factor_count)]
    ops = [" * " if prng() < 0.5 else " / " for _ in range(factor_count - 1)]

    result = factors[0]
    for i in range(len(ops)):
        result += ops[i] + factors[i + 1]
    return result


def _generate_random_factor(prng: Any, depth: int, max_depth: int) -> str:
    if depth < max_depth and prng() < 0.3:
        inner = _generate_random_expr(prng, depth + 1, max_depth)
        return f"({inner})"

    val = int(prng() * 100) + 1
    return str(val)


def _tokenize(input_str: str) -> List[str]:
    tokens: List[str] = []
    i = 0

    while i < len(input_str):
        ch = input_str[i]

        if ch.isspace():
            i += 1
            continue

        if ch in "+-*/()":
            tokens.append(ch)
            i += 1
            continue

        if ch.isdigit() or (ch == "." and i + 1 < len(input_str) and input_str[i + 1].isdigit()):
            num_str = ""
            while i < len(input_str) and (input_str[i].isdigit() or input_str[i] == "."):
                num_str += input_str[i]
                i += 1
            tokens.append(num_str)
            continue

        raise ValueError(f"Unexpected character '{ch}' at index {i}")

    return tokens
