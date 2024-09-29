/**
 * Adapted from: https://stackoverflow.com/questions/61910721/
 *
 * This function accepts an array of PlayerRecord objects and sorts the
 * array in descending order according to the ratio of wins to losses.
 * (win / lose) such that higher ratios of wins to losses are first.
 * Some examples:
 *
 *  - {win: 3, lose: 9}  <  {win: 2, lose: 3} // 3/9  <  2/3
 *  - {win: 2, lose: 2}  >  {win: 2, lose: 3} // 2/2  >  2/3
 *  - {win: 3, lose: 9} === {win: 3, lose: 9} // 3/9 === 3/9
 *
 * In the case where a === b, both [a,b] and [b,a] are valid.
 *
 * @param array array of 0..n wins and losses. Wins and losses are both finite integers >= 0
 * @returns a sorted copy of the same array plus finite sort rank
 */
export function sortByWinLoss(
  array: { win: number; lose: number }[]
): { win: number; lose: number; rank: number }[] {
  return array
    .map((e) => {
      return {
        ...e,
        rank: e.win / e.lose,
      };
    })
    .sort((a, b) => b.rank - a.rank);
}
