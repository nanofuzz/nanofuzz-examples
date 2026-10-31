/*
 * Arithmetic Expression Evaluator and Grammar-Based Input Generator
 *
 * Grammar:
 *   Expr   -> Term (( '+' | '-' ) Term)*
 *   Term   -> Factor (( '*' | '/' ) Factor)*
 *   Factor -> Number | '(' Expr ')' | '-' Factor | '+' Factor
 */

package goexamples

import (
	"fmt"
	"math"
	"math/rand"
	"strconv"
	"strings"

	runtime "github.com/nanofuzz/nanofuzz-runtime/go"
)

// EvaluateExpression parses and evaluates an arithmetic expression string following standard operator precedence.
//
// Parameters:
//   - expr: Arithmetic expression string to evaluate
//
// Returns the numeric float64 result of evaluating the expression.
func EvaluateExpression(expr string) float64 {
	tokens := tokenize(expr)
	parser := &parser{tokens: tokens, pos: 0}
	result := parser.parseExpr()
	if parser.pos < len(tokens) {
		panic(fmt.Sprintf("Unexpected trailing tokens starting at '%s'", tokens[parser.pos]))
	}
	return result
}

// EvaluateExpressionGenerator produces syntactically valid arithmetic expression strings for fuzz testing.
//
// Parameters:
//   - prng: Seeded pseudo-random number generator function returning [0, 1)
//
// Returns a randomly generated arithmetic expression string adhering to the grammar.
func EvaluateExpressionGenerator(prng func() float64) string {
	runtime.Assume(prng != nil)
	return generateRandomExpr(prng, 0, 4)
}

// EvaluateExpressionTransformer skips syntactically invalid expressions using assume.
//
// Parameters:
//   - expr: Candidate expression string
//
// Returns the expression unchanged if valid, or panics with UnsatisfiedAssumptionError if invalid.
func EvaluateExpressionTransformer(expr string) string {
	runtime.Assume(isValidSyntax(expr), "Expression must be syntactically valid")
	return expr
}

// -------------------------------------------------------------------------- //
// Private Helper Functions (Grammar Generator, Parser, Lexer & Syntax Validator)
// -------------------------------------------------------------------------- //

type parser struct {
	tokens []string
	pos    int
}

func (p *parser) peek() (string, bool) {
	if p.pos < len(p.tokens) {
		return p.tokens[p.pos], true
	}
	return "", false
}

func (p *parser) consume() string {
	tok := p.tokens[p.pos]
	p.pos++
	return tok
}

func (p *parser) parseFactor() float64 {
	tok, ok := p.peek()
	if !ok {
		panic("Unexpected end of input while expecting factor")
	}

	if tok == "(" {
		p.consume()
		val := p.parseExpr()
		closing, ok := p.peek()
		if !ok || closing != ")" {
			panic("Expected ')'")
		}
		p.consume()
		return val
	}

	if tok == "-" {
		p.consume()
		return -p.parseFactor()
	}

	if tok == "+" {
		p.consume()
		return p.parseFactor()
	}

	num, err := strconv.ParseFloat(tok, 64)
	if err != nil {
		panic(fmt.Sprintf("Invalid numeric token: '%s'", tok))
	}
	p.consume()
	return num
}

func (p *parser) parseTerm() float64 {
	left := p.parseFactor()
	for {
		tok, ok := p.peek()
		if !ok || (tok != "*" && tok != "/") {
			break
		}
		op := p.consume()
		right := p.parseFactor()
		if op == "*" {
			left *= right
		} else {
			if right == 0 {
				panic("Division by zero in arithmetic expression")
			}
			left /= right
		}
	}
	return left
}

func (p *parser) parseExpr() float64 {
	left := p.parseTerm()
	for {
		tok, ok := p.peek()
		if !ok || (tok != "+" && tok != "-") {
			break
		}
		op := p.consume()
		right := p.parseTerm()
		if op == "+" {
			left += right
		} else {
			left -= right
		}
	}
	return left
}

func tokenize(expr string) []string {
	var tokens []string
	chars := []rune(expr)
	i := 0
	for i < len(chars) {
		c := chars[i]
		if c == ' ' || c == '\t' || c == '\r' || c == '\n' {
			i++
			continue
		}
		if c == '+' || c == '-' || c == '*' || c == '/' || c == '(' || c == ')' {
			tokens = append(tokens, string(c))
			i++
			continue
		}
		if (c >= '0' && c <= '9') || c == '.' {
			start := i
			for i < len(chars) && ((chars[i] >= '0' && chars[i] <= '9') || chars[i] == '.') {
				i++
			}
			tokens = append(tokens, string(chars[start:i]))
			continue
		}
		panic(fmt.Sprintf("Unexpected character in expression: '%c'", c))
	}
	return tokens
}

func isValidSyntax(expr string) bool {
	defer func() {
		_ = recover()
	}()
	tokens := tokenize(expr)
	p := &parser{tokens: tokens, pos: 0}
	p.parseExpr()
	return p.pos == len(tokens)
}

func generateRandomExpr(prng func() float64, depth, maxDepth int) string {
	if depth >= maxDepth || prng() < 0.4 {
		return strconv.Itoa(int(prng()*20.0) + 1)
	}
	choice := int(prng() * 5.0)
	switch choice {
	case 0:
		return fmt.Sprintf("%s + %s", generateRandomExpr(prng, depth+1, maxDepth), generateRandomExpr(prng, depth+1, maxDepth))
	case 1:
		return fmt.Sprintf("%s - %s", generateRandomExpr(prng, depth+1, maxDepth), generateRandomExpr(prng, depth+1, maxDepth))
	case 2:
		return fmt.Sprintf("%s * %s", generateRandomExpr(prng, depth+1, maxDepth), generateRandomExpr(prng, depth+1, maxDepth))
	case 3:
		right := generateRandomExpr(prng, depth+1, maxDepth)
		if right == "0" {
			right = "1"
		}
		return fmt.Sprintf("%s / %s", generateRandomExpr(prng, depth+1, maxDepth), right)
	default:
		return fmt.Sprintf("(%s)", generateRandomExpr(prng, depth+1, maxDepth))
	}
}

// Suppress unused imports check
var _ = math.Abs
var _ = strings.TrimSpace
var _ = rand.Float64
