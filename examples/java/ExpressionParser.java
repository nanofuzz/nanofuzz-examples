import com.nanofuzz.runtime.Assume;
import java.util.ArrayList;
import java.util.List;
import java.util.function.DoubleSupplier;

/**
 * Arithmetic Expression Evaluator and Grammar-Based Input Generator.
 *
 * Grammar:
 * Expr -> Term (( '+' | '-' ) Term)*
 * Term -> Factor (( '*' | '/' ) Factor)*
 * Factor -> Number | '(' Expr ')' | '-' Factor | '+' Factor
 */
public class ExpressionParser {

  /**
   * Parses and evaluates an arithmetic expression string following standard
   * operator precedence.
   *
   * @param expr The arithmetic expression string to evaluate
   * @return The numeric result of evaluating the expression
   */
  public static double evaluateExpression(String expr) {
    List<String> tokens = tokenize(expr);
    Parser parser = new Parser(tokens);
    double result = parser.parseExpr();
    if (parser.pos < tokens.size()) {
      throw new IllegalArgumentException(
          "Unexpected trailing tokens starting at '" + tokens.get(parser.pos) + "'");
    }
    return result;
  } // fn: evaluateExpression

  /**
   * User-provided input generator producing syntactically valid arithmetic
   * expression strings.
   *
   * @param prng Seeded pseudo-random number generator function returning [0, 1)
   * @return Argument array containing a valid expression string
   */
  public static Object[] evaluateExpressionGenerator(DoubleSupplier prng) {
    int maxDepth = 4;
    String exprString = generateRandomExpr(prng, 0, maxDepth);
    return new Object[] { exprString };
  } // fn: evaluateExpressionGenerator

  /**
   * Input transformer that skips syntactically-invalid expressions.
   *
   * @param expr The arithmetic expression candidate string
   * @return Argument array containing the validated expression
   */
  public static Object[] evaluateExpressionTransformer(String expr) {
    Assume.that(isValidSyntax(expr), "Expression must be syntactically valid");
    return new Object[] { expr };
  } // fn: evaluateExpressionTransformer

  // -------------------------------------------------------------------------- //
  // Private Helper Functions (Grammar Generator, Parser, Lexer & Syntax
  // Validator)
  // -------------------------------------------------------------------------- //

  private static boolean isValidSyntax(String expr) {
    List<String> tokens = tokenizeSafe(expr);
    if (tokens == null || tokens.isEmpty()) {
      return false;
    }
    int[] posRef = new int[] { 0 };
    if (!checkExpr(tokens, posRef)) {
      return false;
    }
    return posRef[0] == tokens.size();
  } // fn: isValidSyntax

  private static boolean checkFactor(List<String> tokens, int[] posRef) {
    if (posRef[0] >= tokens.size()) {
      return false;
    }
    String tok = tokens.get(posRef[0]);
    if ("(".equals(tok)) {
      posRef[0]++;
      if (!checkExpr(tokens, posRef)) {
        return false;
      }
      if (posRef[0] >= tokens.size() || !")".equals(tokens.get(posRef[0]))) {
        return false;
      }
      posRef[0]++;
      return true;
    }
    if ("-".equals(tok) || "+".equals(tok)) {
      posRef[0]++;
      return checkFactor(tokens, posRef);
    }
    try {
      Double.parseDouble(tok);
      posRef[0]++;
      return true;
    } catch (NumberFormatException e) {
      return false;
    }
  } // fn: checkFactor

  private static boolean checkTerm(List<String> tokens, int[] posRef) {
    if (!checkFactor(tokens, posRef)) {
      return false;
    }
    while (posRef[0] < tokens.size() && ("*".equals(tokens.get(posRef[0])) || "/".equals(tokens.get(posRef[0])))) {
      posRef[0]++;
      if (!checkFactor(tokens, posRef)) {
        return false;
      }
    }
    return true;
  } // fn: checkTerm

  private static boolean checkExpr(List<String> tokens, int[] posRef) {
    if (!checkTerm(tokens, posRef)) {
      return false;
    }
    while (posRef[0] < tokens.size() && ("+".equals(tokens.get(posRef[0])) || "-".equals(tokens.get(posRef[0])))) {
      posRef[0]++;
      if (!checkTerm(tokens, posRef)) {
        return false;
      }
    }
    return true;
  } // fn: checkExpr

  private static List<String> tokenizeSafe(String input) {
    List<String> tokens = new ArrayList<>();
    int i = 0;
    int len = input.length();

    while (i < len) {
      char ch = input.charAt(i);

      if (Character.isWhitespace(ch)) {
        i++;
        continue;
      }

      if (ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '(' || ch == ')') {
        tokens.add(String.valueOf(ch));
        i++;
        continue;
      }

      if (Character.isDigit(ch) || (ch == '.' && i + 1 < len && Character.isDigit(input.charAt(i + 1)))) {
        StringBuilder numStr = new StringBuilder();
        while (i < len && (Character.isDigit(input.charAt(i)) || input.charAt(i) == '.')) {
          numStr.append(input.charAt(i));
          i++;
        }
        tokens.add(numStr.toString());
        continue;
      }

      return null;
    }

    return tokens;
  } // fn: tokenizeSafe

  private static String generateRandomExpr(DoubleSupplier prng, int depth, int maxDepth) {
    int termCount = (int) (prng.getAsDouble() * 3) + 1;
    List<String> terms = new ArrayList<>(termCount);
    for (int i = 0; i < termCount; i++) {
      terms.add(generateRandomTerm(prng, depth, maxDepth));
    }
    List<String> ops = new ArrayList<>(Math.max(0, termCount - 1));
    for (int i = 0; i < termCount - 1; i++) {
      ops.add(prng.getAsDouble() < 0.5 ? " + " : " - ");
    }

    StringBuilder result = new StringBuilder(terms.get(0));
    for (int i = 0; i < ops.size(); i++) {
      result.append(ops.get(i)).append(terms.get(i + 1));
    }
    return result.toString();
  } // fn: generateRandomExpr

  private static String generateRandomTerm(DoubleSupplier prng, int depth, int maxDepth) {
    int factorCount = (int) (prng.getAsDouble() * 3) + 1;
    List<String> factors = new ArrayList<>(factorCount);
    for (int i = 0; i < factorCount; i++) {
      factors.add(generateRandomFactor(prng, depth, maxDepth));
    }
    List<String> ops = new ArrayList<>(Math.max(0, factorCount - 1));
    for (int i = 0; i < factorCount - 1; i++) {
      ops.add(prng.getAsDouble() < 0.5 ? " * " : " / ");
    }

    StringBuilder result = new StringBuilder(factors.get(0));
    for (int i = 0; i < ops.size(); i++) {
      result.append(ops.get(i)).append(factors.get(i + 1));
    }
    return result.toString();
  } // fn: generateRandomTerm

  private static String generateRandomFactor(DoubleSupplier prng, int depth, int maxDepth) {
    if (depth < maxDepth && prng.getAsDouble() < 0.3) {
      String inner = generateRandomExpr(prng, depth + 1, maxDepth);
      return "(" + inner + ")";
    }

    int val = (int) (prng.getAsDouble() * 100) + 1;
    return String.valueOf(val);
  } // fn: generateRandomFactor

  private static List<String> tokenize(String input) {
    List<String> tokens = new ArrayList<>();
    int i = 0;
    int len = input.length();

    while (i < len) {
      char ch = input.charAt(i);

      if (Character.isWhitespace(ch)) {
        i++;
        continue;
      }

      if (ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '(' || ch == ')') {
        tokens.add(String.valueOf(ch));
        i++;
        continue;
      }

      if (Character.isDigit(ch) || (ch == '.' && i + 1 < len && Character.isDigit(input.charAt(i + 1)))) {
        StringBuilder numStr = new StringBuilder();
        while (i < len && (Character.isDigit(input.charAt(i)) || input.charAt(i) == '.')) {
          numStr.append(input.charAt(i));
          i++;
        }
        tokens.add(numStr.toString());
        continue;
      }

      throw new IllegalArgumentException("Unexpected character '" + ch + "' at index " + i);
    }

    return tokens;
  } // fn: tokenize

  private static class Parser {
    private final List<String> tokens;
    private int pos = 0;

    Parser(List<String> tokens) {
      this.tokens = tokens;
    } // fn: Parser

    private String peek() {
      return pos < tokens.size() ? tokens.get(pos) : null;
    } // fn: peek

    private String consume() {
      String token = tokens.get(pos);
      pos++;
      return token;
    } // fn: consume

    private double parseFactor() {
      String token = peek();
      if (token == null) {
        throw new IllegalArgumentException("Unexpected end of input while expecting factor");
      }

      if ("(".equals(token)) {
        consume();
        double val = parseExpr();
        if (!")".equals(peek())) {
          throw new IllegalArgumentException("Expected ')' but found '" + peek() + "'");
        }
        consume();
        return val;
      }

      if ("-".equals(token)) {
        consume();
        return -parseFactor();
      }

      if ("+".equals(token)) {
        consume();
        return parseFactor();
      }

      try {
        return Double.parseDouble(consume());
      } catch (NumberFormatException e) {
        throw new IllegalArgumentException("Invalid numeric token: '" + token + "'");
      }
    } // fn: parseFactor

    private double parseTerm() {
      double left = parseFactor();

      while (peek() != null && ("*".equals(peek()) || "/".equals(peek()))) {
        String op = consume();
        double right = parseFactor();
        if ("*".equals(op)) {
          left *= right;
        } else {
          if (right == 0.0) {
            throw new ArithmeticException("Division by zero in arithmetic expression");
          }
          left /= right;
        }
      }

      return left;
    } // fn: parseTerm

    private double parseExpr() {
      double left = parseTerm();

      while (peek() != null && ("+".equals(peek()) || "-".equals(peek()))) {
        String op = consume();
        double right = parseTerm();
        if ("+".equals(op)) {
          left += right;
        } else {
          left -= right;
        }
      }

      return left;
    } // fn: parseExpr
  } // class: Parser
} // class: ExpressionParser
