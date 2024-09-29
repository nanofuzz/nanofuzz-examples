/**
 * Adapted from: https://stackoverflow.com/questions/65428615/
 *
 * This function accepts an array of numbers and returns the string
 * name of the first number === 0.  If no match is found, return "".
 *
 * @param inArray array of 0..n finite integers
 * @returns the string of the first object with value === 0, else "".
 */
export function getZero(inArray: number[]): string {
  return inArray.filter((q) => q === 0)[0].toString();
}
