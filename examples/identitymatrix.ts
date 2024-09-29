import { FuzzTestResult } from "@nanofuzz/runtime";
/**
 * Adapted from: https://rosettacode.org/wiki/Identity_matrix#TypeScript
 *
 * This function returns an identity matrix of n x n size such that:
 *   n = 1 => [[1]],
 *   n = 2 => [[1,0],[0,1],
 *   n = 3 => [[1,0,0],[0,1,0],[0,0,1]],
 *   ... and so on ...
 *
 * @param n finite integer >=1
 * @returns number[n][n] identity matrix of n x n size
 */
export function identity(n: number): number[][] {
  const matrix: number[][] = new Array(n).fill(new Array(n).fill(0));
  for (let i = 0; i < n; i++) matrix[i][i] = 1;
  return matrix;
}

export function identityValidator(r: FuzzTestResult): boolean {
  const output: number[][] = r.out;
  for (let i = 0; i < output.length; i++) {
    for (let j = 0; j < output[i].length; j++) {
      if (i == j && output[i][j] != 1) return false;
      if (i != j && output[i][j] != 0) return false;
    }
  }
  return true;
}
