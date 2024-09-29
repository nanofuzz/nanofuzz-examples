import { FuzzTestResult } from "@nanofuzz/runtime";
/**
 * Adapted from: https://rosettacode.org/wiki/Least_common_multiple#TypeScript
 *
 * Given two finite integers, returns the least common
 * multiple (lcm), which is the smallest positive number
 * divisible by two integers, m and n.
 *
 * Note:
 * - The lcm of 0 and any other number is 0.
 * - The lcm of two non-zero numbers cannot be 0.
 * - The lcm is always non-negative.
 *
 * Examples:
 *   0,0  --> 0
 *   2,10 --> 10
 *   2,7  --> 14
 *  -5,3  --> 15
 *
 * @param m finite integer
 * @param n finite integer
 * @returns lcm
 */
export function lcm(m: number, n: number): number {
  return Math.floor(m / gcd(m, n)) * n;

  // Returns the greatest common divisor of two integers
  function gcd(a: number, b: number): number {
    if (b === 0) return a;
    else return gcd(b, a % b);
  }
}

export function lcmValidator(r: FuzzTestResult): boolean {
  const [m, n] = r.in;
  const output: number = r.out;
  if (output === 0) {
    return m === 0 || n === 0;
  }
  return output > 0;
}
