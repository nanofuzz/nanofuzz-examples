import { FuzzTestResult } from "@nanofuzz/runtime";
/**
 * Adapted from: https://runjs.app/blog/equations-that-changed-the-world-rewritten-in-javascript
 *
 * Returns height of bell curve at a given x-coordinate (for
 * a normal distribution).
 *
 * |              . * .
 * |             *     *        x axis: x=distance from center
 * |           .         .      y axis: output=height of bell curve
 * |          *           *
 * |        *               *
 * |_._._*_ _ _ _ _ _ _ _ _ _ _*_._._ _
 *                  0       (x axis)
 *
 * The bell curve is centered at mu, the mean. Assume mu=0.
 *
 * The spread of the bell curve depends on sigma, the standard
 * deviation. Sigma is an integer, 1 or 0.
 *
 * Note:
 * - The output (height of bell curve) should always be positive,
 *   and cannot be 0
 *
 * @param x a finite integer
 * @param mu mu=0 (mean)
 * @param sigma integer=0 or 1
 * @returns height of bell curve at the x-coordinate
 */
export function normalDistributionPDF(x: number, mu: number, sigma: number) {
  const sqrtTwoPi = Math.sqrt(2 * Math.PI);
  const exponent = -0.5 * ((x - mu) / sigma) ** 2;
  return (1 / (sigma * sqrtTwoPi)) * Math.exp(exponent);
}

export function normalDistributionPDFValidator(r: FuzzTestResult): boolean {
  // Height of bell curve is not greater than 1
  return !(r.out > 1);
}

export function normalDistributionPDFValidator1(r: FuzzTestResult): boolean {
  // Array of inputs: r.in   Output: r.out
  // return false; // <-- Unexpected; failed
  return r.out > 0;
}
