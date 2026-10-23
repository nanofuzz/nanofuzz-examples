use nanofuzz_runtime::assume;

/**
 * Arithmetic Expression Evaluator and Grammar-Based Input Generator
 *
 * Grammar:
 *   Expr   -> Term (( '+' | '-' ) Term)*
 *   Term   -> Factor (( '*' | '/' ) Factor)*
 *   Factor -> Number | '(' Expr ')' | '-' Factor | '+' Factor
 */

/// Parses and evaluates an arithmetic expression string following standard operator precedence.
pub fn evaluate_expression(expr: &str) -> f64 {
    let tokens = tokenize(expr);
    let mut parser = Parser::new(&tokens);
    let result = parser.parse_expr();
    if parser.pos < tokens.len() {
        panic!(
            "Unexpected trailing tokens starting at '{}'",
            tokens[parser.pos]
        );
    }
    result
} // fn: evaluate_expression

/// User-provided input generator that produces syntactically valid arithmetic expression strings.
pub fn evaluate_expression_generator(mut prng: impl FnMut() -> f64) -> Option<(String,)> {
    let max_depth = 4;
    let expr_string = generate_random_expr(&mut prng, 0, max_depth);
    Some((expr_string,))
} // fn: evaluate_expression_generator

/// Input transformer that skips syntactically-invalid expressions.
pub fn evaluate_expression_transformer(expr: &str) -> (String,) {
    assume(
        is_valid_syntax(expr),
        Some("Expression must be syntactically valid"),
    );
    (expr.to_string(),)
} // fn: evaluate_expression_transformer

// -------------------------------------------------------------------------- //
// Private Helper Functions (Grammar Generator, Parser, Lexer & Syntax Validator)
// -------------------------------------------------------------------------- //

fn is_valid_syntax(expr: &str) -> bool {
    let tokens = match tokenize_safe(expr) {
        Some(t) if !t.is_empty() => t,
        _ => return false,
    };
    let mut pos = 0;
    if !check_expr(&tokens, &mut pos) {
        return false;
    }
    pos == tokens.len()
} // fn: is_valid_syntax

fn check_factor(tokens: &[String], pos: &mut usize) -> bool {
    if *pos >= tokens.len() {
        return false;
    }
    let tok = &tokens[*pos];
    if tok == "(" {
        *pos += 1;
        if !check_expr(tokens, pos) {
            return false;
        }
        if *pos >= tokens.len() || tokens[*pos] != ")" {
            return false;
        }
        *pos += 1;
        return true;
    }
    if tok == "-" || tok == "+" {
        *pos += 1;
        return check_factor(tokens, pos);
    }
    if tok.parse::<f64>().is_ok() {
        *pos += 1;
        return true;
    }
    false
} // fn: check_factor

fn check_term(tokens: &[String], pos: &mut usize) -> bool {
    if !check_factor(tokens, pos) {
        return false;
    }
    while *pos < tokens.len() && (tokens[*pos] == "*" || tokens[*pos] == "/") {
        *pos += 1;
        if !check_factor(tokens, pos) {
            return false;
        }
    }
    true
} // fn: check_term

fn check_expr(tokens: &[String], pos: &mut usize) -> bool {
    if !check_term(tokens, pos) {
        return false;
    }
    while *pos < tokens.len() && (tokens[*pos] == "+" || tokens[*pos] == "-") {
        *pos += 1;
        if !check_term(tokens, pos) {
            return false;
        }
    }
    true
} // fn: check_expr

fn tokenize_safe(input: &str) -> Option<Vec<String>> {
    let mut tokens = Vec::new();
    let chars: Vec<char> = input.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let ch = chars[i];

        if ch.is_whitespace() {
            i += 1;
            continue;
        }

        if matches!(ch, '+' | '-' | '*' | '/' | '(' | ')') {
            tokens.push(ch.to_string());
            i += 1;
            continue;
        }

        if ch.is_ascii_digit()
            || (ch == '.' && i + 1 < chars.len() && chars[i + 1].is_ascii_digit())
        {
            let mut num_str = String::new();
            while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.') {
                num_str.push(chars[i]);
                i += 1;
            }
            tokens.push(num_str);
            continue;
        }

        return None;
    }

    Some(tokens)
} // fn: tokenize_safe

struct Parser<'a> {
    tokens: &'a [String],
    pos: usize,
}

impl<'a> Parser<'a> {
    fn new(tokens: &'a [String]) -> Self {
        Self { tokens, pos: 0 }
    } // fn: new

    fn peek(&self) -> Option<&'a str> {
        self.tokens.get(self.pos).map(|s| s.as_str())
    } // fn: peek

    fn consume(&mut self) -> &'a str {
        let token = &self.tokens[self.pos];
        self.pos += 1;
        token.as_str()
    } // fn: consume

    fn parse_factor(&mut self) -> f64 {
        let token = match self.peek() {
            Some(t) => t,
            None => panic!("Unexpected end of input while expecting factor"),
        };

        if token == "(" {
            self.consume();
            let val = self.parse_expr();
            if self.peek() != Some(")") {
                panic!(
                    "Expected ')' but found '{:?}'",
                    self.peek().unwrap_or("<end>")
                );
            }
            self.consume();
            return val;
        }

        if token == "-" {
            self.consume();
            return -self.parse_factor();
        }

        if token == "+" {
            self.consume();
            return self.parse_factor();
        }

        match token.parse::<f64>() {
            Ok(val) => {
                self.consume();
                val
            }
            Err(_) => panic!("Invalid numeric token: '{}'", token),
        }
    } // fn: parse_factor

    fn parse_term(&mut self) -> f64 {
        let mut left = self.parse_factor();

        while let Some(op) = self.peek() {
            if op != "*" && op != "/" {
                break;
            }
            let op = self.consume();
            let right = self.parse_factor();
            if op == "*" {
                left *= right;
            } else {
                if right == 0.0 {
                    panic!("Division by zero in arithmetic expression");
                }
                left /= right;
            }
        }

        left
    } // fn: parse_term

    fn parse_expr(&mut self) -> f64 {
        let mut left = self.parse_term();

        while let Some(op) = self.peek() {
            if op != "+" && op != "-" {
                break;
            }
            let op = self.consume();
            let right = self.parse_term();
            if op == "+" {
                left += right;
            } else {
                left -= right;
            }
        }

        left
    } // fn: parse_expr
}

fn generate_random_expr(prng: &mut impl FnMut() -> f64, depth: usize, max_depth: usize) -> String {
    let term_count = (prng() * 3.0) as usize + 1;
    let mut terms = Vec::with_capacity(term_count);
    for _ in 0..term_count {
        terms.push(generate_random_term(prng, depth, max_depth));
    }
    let mut ops = Vec::with_capacity(term_count.saturating_sub(1));
    for _ in 0..term_count.saturating_sub(1) {
        ops.push(if prng() < 0.5 { " + " } else { " - " });
    }

    let mut result = terms[0].clone();
    for i in 0..ops.len() {
        result.push_str(ops[i]);
        result.push_str(&terms[i + 1]);
    }
    result
} // fn: generate_random_expr

fn generate_random_term(prng: &mut impl FnMut() -> f64, depth: usize, max_depth: usize) -> String {
    let factor_count = (prng() * 3.0) as usize + 1;
    let mut factors = Vec::with_capacity(factor_count);
    for _ in 0..factor_count {
        factors.push(generate_random_factor(prng, depth, max_depth));
    }
    let mut ops = Vec::with_capacity(factor_count.saturating_sub(1));
    for _ in 0..factor_count.saturating_sub(1) {
        ops.push(if prng() < 0.5 { " * " } else { " / " });
    }

    let mut result = factors[0].clone();
    for i in 0..ops.len() {
        result.push_str(ops[i]);
        result.push_str(&factors[i + 1]);
    }
    result
} // fn: generate_random_term

fn generate_random_factor(
    prng: &mut impl FnMut() -> f64,
    depth: usize,
    max_depth: usize,
) -> String {
    if depth < max_depth && prng() < 0.3 {
        let inner = generate_random_expr(prng, depth + 1, max_depth);
        return format!("({})", inner);
    }

    let val = (prng() * 100.0) as i64 + 1;
    val.to_string()
} // fn: generate_random_factor

fn tokenize(input: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let chars: Vec<char> = input.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let ch = chars[i];

        if ch.is_whitespace() {
            i += 1;
            continue;
        }

        if matches!(ch, '+' | '-' | '*' | '/' | '(' | ')') {
            tokens.push(ch.to_string());
            i += 1;
            continue;
        }

        if ch.is_ascii_digit()
            || (ch == '.' && i + 1 < chars.len() && chars[i + 1].is_ascii_digit())
        {
            let mut num_str = String::new();
            while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.') {
                num_str.push(chars[i]);
                i += 1;
            }
            tokens.push(num_str);
            continue;
        }

        panic!("Unexpected character '{}' at index {}", ch, i);
    }

    tokens
} // fn: tokenize
