/**
 * Adapted from: https://stackoverflow.com/questions/65671694/
 *
 * Sums an array of dinner expenses.  If `total` is passed in as a parameter,
 * use it as the starting total.
 *
 * @param dinners Array of 0..n finite numbers (may be positive, negative, or zero).
 * @param total Optional finite number that is the starting total. (otherwise starting total is 0.0)
 * @returns The sum of the dinner expenses + the input total, if present.
 */
export function totalDinnerExpenses(dinners: number[], total?: any): number {
  dinners.forEach((item) => (total += item));
  return total;
}
