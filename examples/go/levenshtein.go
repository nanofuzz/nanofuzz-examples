package goexamples

// Levenshtein returns the edit distance between strings a and b.
// Adapted from: https://rosettacode.org/wiki/Levenshtein_distance#TypeScript
//
// The Levenshtein distance is a metric for measuring the amount of difference
// between two sequences (i.e. an edit distance). The Levenshtein distance
// between two strings (a and b) is defined as the minimum number of edits
// needed to transform one string into the other, with the allowable edit
// operations being insertion, deletion, or substitution of a single character.
//
// Parameters:
//   - a: Original string
//   - b: Target string after editing a
//
// Returns:
//
//	The number of edits needed to transform a to b.
//
// Bug from RosettaCode / TypeScript / Java / Python / Rust / OCaml:
// When a is empty, u has length 0, causing an index out of range panic.
func Levenshtein(a string, b string) int {
	aChars := []rune(a)
	bChars := []rune(b)
	m := len(aChars)
	n := len(bChars)
	t := make([]int, n+1)
	for j := 0; j <= n; j++ {
		t[j] = j
	}
	var u []int
	for i := 0; i < m; i++ {
		u = make([]int, n+1)
		u[0] = i + 1
		for j := 0; j < n; j++ {
			if aChars[i] == bChars[j] {
				u[j+1] = t[j]
			} else {
				minVal := t[j]
				if t[j+1] < minVal {
					minVal = t[j+1]
				}
				if u[j] < minVal {
					minVal = u[j]
				}
				u[j+1] = 1 + minVal
			}
		}
		t = u
	}
	// Bug from RosettaCode / TypeScript: when a == "", u is empty slice ([]int), throwing index out of range
	return u[n]
}
