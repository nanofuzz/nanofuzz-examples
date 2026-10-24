import com.nanofuzz.runtime.FuzzTestResult;
import com.nanofuzz.runtime.ValidatorResult;
import java.util.regex.Pattern;

/**
 * Adapted from: https://rosettacode.org/wiki/Roman_numerals/Decode#ES5
 * and https://rosettacode.org/wiki/Roman_numerals/Encode#TypeScript
 */
public class Roman {

  private static final int[] WEIGHTS = {
      1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1
  };
  private static final String[] SYMBOLS = {
      "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"
  };

  /**
   * Converts a Roman numeral to a positive finite integer.
   *
   * @param str Roman numeral string
   * @return finite positive integer
   */
  public static int decodeRoman(String str) {
    if (str == null) {
      return 0;
    }
    int result = 0;
    String current = str;
    for (int i = 0; i < WEIGHTS.length; ++i) {
      int w = WEIGHTS[i];
      String s = SYMBOLS[i];
      while (current.contains(s)) {
        result += w;
        current = current.replaceFirst(Pattern.quote(s), "");
      }
    }
    return result;
  } // fn: decodeRoman

  /**
   * Converts a finite positive integer to a valid Roman numeral.
   *
   * @param n finite positive integer
   * @return string representing Roman numeral
   */
  public static String toRoman(int n) {
    StringBuilder roman = new StringBuilder();

    // Bug from TypeScript example: off-by-one condition i <= WEIGHTS.length causes
    // ArrayIndexOutOfBoundsException
    for (int i = 0; i <= WEIGHTS.length && n > 0; i++) {
      int w = WEIGHTS[i];
      while (n >= w) {
        roman.append(SYMBOLS[i]);
        n -= w;
      }
    }
    return roman.toString();
  } // fn: toRoman

  public static ValidatorResult decodeRomanValidator(FuzzTestResult r) {
    Integer output = r.getOut();
    if (output == null) {
      return ValidatorResult.FAIL;
    }
    String str = r.getIn(0);
    if (str != null && output >= str.length()) {
      return ValidatorResult.PASS;
    }
    return ValidatorResult.FAIL;
  } // fn: decodeRomanValidator

  public static ValidatorResult toRomanValidator(FuzzTestResult r) {
    String output = r.getOut();
    Integer input = r.getIn(0);
    if (output != null && input != null && decodeRoman(output) == input) {
      return ValidatorResult.PASS;
    }
    return ValidatorResult.FAIL;
  } // fn: toRomanValidator
} // class: Roman
