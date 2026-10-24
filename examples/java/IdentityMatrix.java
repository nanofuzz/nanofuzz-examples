import com.nanofuzz.runtime.FuzzTestResult;
import com.nanofuzz.runtime.ValidatorResult;

/**
 * Adapted from: https://rosettacode.org/wiki/Identity_matrix#TypeScript
 *
 * This function returns an identity matrix of n x n size such that:
 * n = 1 => [[1]],
 * n = 2 => [[1,0],[0,1]],
 * n = 3 => [[1,0,0],[0,1,0],[0,0,1]],
 * ... and so on ...
 *
 * @param n finite integer >= 1
 * @return int[n][n] identity matrix of n x n size
 */
public class IdentityMatrix {

  public static int[][] identity(int n) {
    if (n <= 0) {
      return new int[0][0];
    }
    int[][] matrix = new int[n][];
    // Bug from RosettaCode / TypeScript example: all rows share the same array
    // reference
    int[] row = new int[n];
    for (int i = 0; i < n; i++) {
      matrix[i] = row;
    }
    for (int i = 0; i < n; i++) {
      matrix[i][i] = 1;
    }
    return matrix;
  } // fn: identity

  public static ValidatorResult identityValidator(FuzzTestResult r) {
    int[][] output = r.getOut();
    if (output == null) {
      return ValidatorResult.FAIL;
    }
    for (int i = 0; i < output.length; i++) {
      for (int j = 0; j < output[i].length; j++) {
        if (i == j && output[i][j] != 1)
          return ValidatorResult.FAIL;
        if (i != j && output[i][j] != 0)
          return ValidatorResult.FAIL;
      }
    }
    return ValidatorResult.PASS;
  } // fn: identityValidator
} // class: IdentityMatrix
