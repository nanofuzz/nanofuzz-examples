import { FuzzTestResult } from "@nanofuzz/runtime";

// Weights and numerals
const weightsSymbols: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/**
 * Adapted from: https://rosettacode.org/wiki/Roman_numerals/Decode#ES5
 *
 * Converts a Roman numeral to a positive finite integer. If the Roman
 * numeral is invalid, throws an exception.
 *
 * Roman numerals:
 *  -'M':1000, 'D':500, 'C':100, 'L':50, 'X':10, 'V':5, 'I':1
 *  - When a "smaller" numeral appears anywhere before a "larger"
 *    numeral, we subtract it (ex: 'IV' = -1+5 = 4).
 *
 * @param str Roman numeral
 * @returns finite positive integer
 */
export function decodeRoman(str: string): number {
  var result = 0;
  for (var i = 0; i < weightsSymbols.length; ++i) {
    var w = weightsSymbols[i][0];
    var s = weightsSymbols[i][1];
    var regex = RegExp(s);
    while (str.match(regex)) {
      result += w;
      str = str.replace(regex, "");
    }
  }
  return result;
}

/**
 * Adapted from: https://rosettacode.org/wiki/Roman_numerals/Encode#TypeScript
 *
 * *** Note: you may assume this function is correct. ***
 *
 * Converts a finite positive integer to a valid Roman numeral.
 *
 * Reading Roman numerals:
 *  -'M':1000, 'D':500, 'C':100, 'L':50, 'X':10, 'V':5, 'I':1
 *  - Iterate through the string and add or subtract each numeral
 *    to a running sum.
 *  - If the numeral appears anywhere before a "larger" numeral,
 *    then subtract (ex: 'IV' = -1+5 = 4).
 *  - Example: 'XXIVX'
 *      X    X     I     V     X
 *      10
 *          +10
 *                -1 ('I' has larger numeral 'V' or 'X' after it)
 *                       -5 ('V' has larger numeral 'X' after it)
 *                            +10
 *     = 10+10-1-5+10
 *     = 24
 *
 * Examples:
 *  - 6 --> 'VI':  6 = 5+1 = 'V'+'I' = 'VI'
 *  - 24 --> 'XXIV':  24 = 10+10+(-1)+5 = 'XXIV'
 *  - 59 --> 'LIX':  59 = 50+(-1)+10 = 'LIX'
 *
 * @param n finite positive integer
 * @returns string representing valid Roman numeral
 */
export function toRoman(n: number): string {
  var roman = ""; // Result

  for (let i = 0; i <= weightsSymbols.length && n > 0; i++) {
    var w = weightsSymbols[i][0];
    while (n >= w) {
      roman += weightsSymbols[i][1];
      n -= w;
    }
  }
  return roman;
}

export function decodeRoman_length(r: FuzzTestResult): boolean {
  const output: number = r.out;
  // decodeRoman(): Value of num >= length of roman numeral str
  const str = r.in[0];
  const num = output;
  return num >= str.length;
}

export function toRoman_roundtrip(r: FuzzTestResult): boolean {
  const output: string = r.out;
  // Check that decodeRoman(toRoman(x)) === x
  // Note: failures could indicate a problem in either
  // toRoman or decodeRoman!
  return decodeRoman(r.out) === r.in[0];
}
