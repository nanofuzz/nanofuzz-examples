import { FuzzTestResult } from "@nanofuzz/runtime";
/**
 * Adapted from: https://rosettacode.org/wiki/Prime_decomposition?diff=prev&oldid=56106#
 *
 * Given an integer n where 2 <= n <= 100, returns an array
 * of prime numbers that multiply to n (the prime
 * decomposition).
 *
 * Example:
 * - 20	yields [2,2,5]
 * - 17 yields [17]
 *
 * @param n an integer, 2 <= n <= 100
 * @returns array of prime numbers
 */
export function primeFactorize(n: number): number[] {
  if (n <= 3) return [n];

  var ans: number[] = [];
  var done = false;
  while (!done) {
    if (n % 2 === 0) {
      ans.push(2);
      n /= 2;
      continue;
    }
    if (n % 3 === 0) {
      ans.push(3);
      n /= 3;
      continue;
    }
    if (n === 1) return ans;
    var sr = Math.sqrt(n);
    done = true;
    // try to divide the checked number by all numbers till its square root.
    for (var i = 6; i <= sr; i += 6) {
      if (n % (i - 1) === 0) {
        // is n divisible by i-1?
        ans.push(i - 1);
        n /= i - 1;
        done = false;
        break;
      }
      if (n % (i + 1) === 0) {
        // is n divisible by i+1?
        ans.push(i + 1);
        n /= i + 1;
        done = false;
        break;
      }
    }
  }
  ans.push(n);
  return ans;
}

/**
 * Returns whether an integer >= 2 is prime.
 * *** Note: you may assume this function is correct. ***
 */
function isPrime(n: number) {
  for (let x = 2; x <= Math.sqrt(n); ++x) {
    if (n % x === 0) return false;
  }
  return true;
}

export function primeFactorizeReverse(r: FuzzTestResult): boolean {
  const output: number[] = r.out;
  // Multiplies to original number
  let prod = 1;
  for (let i = 0; i < output.length; ++i) {
    prod *= output[i];
  }
  return prod === r.in[0];
}

export function primeFactorizeAllPrimeOutputs(r: FuzzTestResult): boolean {
  const output: number[] = r.out;
  // All numbers in output are prime
  for (let i = 0; i < r.out.length; ++i) {
    if (!isPrime(output[i])) {
      return false;
    }
  }
  return true;
}
