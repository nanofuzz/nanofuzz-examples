/// Adapted from: https://rosettacode.org/wiki/Levenshtein_distance#TypeScript
///
/// The Levenshtein distance is a metric for measuring the amount of difference
/// between two sequences (i.e. an edit distance). The Levenshtein distance
/// between two strings (a and b) is defined as the minimum number of edits
/// needed to transform one string into the other, with the allowable edit
/// operations being insertion, deletion, or substitution of a single character.
///
/// @param a the original string
/// @param b the final string after editing a
/// @return the number of edits needed to transform a to b
pub fn levenshtein(a: String, b: String) -> usize {
    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();
    let m = a_chars.len();
    let n = b_chars.len();
    let mut t: Vec<usize> = (0..=n).collect();
    let mut u: Vec<usize> = Vec::new();
    for i in 0..m {
        u = vec![0; n + 1];
        u[0] = i + 1;
        for j in 0..n {
            u[j + 1] = if a_chars[i] == b_chars[j] {
                t[j]
            } else {
                1 + t[j].min(t[j + 1].min(u[j]))
            };
        }
        t = u.clone();
    }
    // Bug from RosettaCode / TypeScript example: when a is empty, u has length 0,
    // causing an index out of bounds panic
    u[n]
} // fn: levenshtein
