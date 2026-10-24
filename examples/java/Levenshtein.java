/**
 * Adapted from: https://rosettacode.org/wiki/Levenshtein_distance#TypeScript
 *
 * The Levenshtein distance is a metric for measuring the amount of difference
 * between two sequences (i.e. an edit distance). The Levenshtein distance
 * between two strings (`a` and `b`) is defined as the minimum number of edits
 * needed to transform one string into the other, with the allowable edit
 * operations being insertion, deletion, or substitution of a single character.
 *
 * @param a the original string
 * @param b the final string after editing `a`
 * @return the number of edits needed to transform `a` to `b`
 */
public class Levenshtein {

  public static int levenshtein(String a, String b) {
    if (a == null || b == null) {
      return 0;
    }
    int m = a.length();
    int n = b.length();
    int[] t = new int[n + 1];
    for (int j = 0; j <= n; j++) {
      t[j] = j;
    }
    int[] u = new int[0];
    for (int i = 0; i < m; i++) {
      u = new int[n + 1];
      u[0] = i + 1;
      for (int j = 0; j < n; j++) {
        u[j + 1] = a.charAt(i) == b.charAt(j) ? t[j] : Math.min(t[j], Math.min(t[j + 1], u[j])) + 1;
      }
      t = u;
    }
    // Bug from RosettaCode / TypeScript example: when a is empty, u has length 0,
    // throwing ArrayIndexOutOfBoundsException
    return u[n];
  } // fn: levenshtein
} // class: Levenshtein
