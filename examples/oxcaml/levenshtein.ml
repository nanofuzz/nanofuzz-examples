(**
 * Adapted from: https://rosettacode.org/wiki/Levenshtein_distance#TypeScript
 *
 * The Levenshtein distance is a metric for measuring the amount of difference
 * between two sequences (i.e. an edit distance). The Levenshtein distance
 * between two strings (a and b) is defined as the minimum number of edits
 * needed to transform one string into the other, with the allowable edit
 * operations being insertion, deletion, or substitution of a single character.
 *
 * @param a the original string
 * @param b the final string after editing a
 * @returns the number of edits needed to transform a to b
 *)
let levenshtein (a : string) (b : string) : int =
  let m = String.length a in
  let n = String.length b in
  let t = ref (Array.init (n + 1) (fun i -> i)) in
  let u = ref [||] in
  for i = 0 to m - 1 do
    u := Array.make (n + 1) 0;
    (!u).(0) <- i + 1;
    for j = 0 to n - 1 do
      (!u).(j + 1) <-
        if a.[i] = b.[j] then (!t).(j)
        else 1 + min (!t).(j) (min (!t).(j + 1) (!u).(j))
    done;
    t := !u
  done;
  (* Bug from RosettaCode / TypeScript: when a = "", !u has length 0, throwing index out of bounds *)
  (!u).(n)
