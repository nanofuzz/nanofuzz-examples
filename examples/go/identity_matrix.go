package goexamples

import (
	runtime "github.com/nanofuzz/nanofuzz-runtime/go"
)

// Identity returns an identity matrix of n x n size.
// Adapted from: https://rosettacode.org/wiki/Identity_matrix#TypeScript
//
// This function returns an identity matrix of n x n size such that:
//
//	n = 1 => [[1]],
//	n = 2 => [[1,0],[0,1]],
//	n = 3 => [[1,0,0],[0,1,0],[0,0,1]],
//	... and so on ...
//
// Parameters:
//   - n: Finite integer >= 1
//
// Returns:
//
//	[][]int identity matrix of size n x n
//
// Bug from RosettaCode / TypeScript / Java / Python / Rust examples:
// All rows share the same underlying slice reference or write to the same row,
// so writing to the diagonal overwrites every row.
func Identity(n int) [][]int {
	runtime.Assume(n >= 1 && n <= 100, "n must be between 1 and 100")
	row := make([]int, n)
	matrix := make([][]int, n)
	for i := 0; i < n; i++ {
		matrix[i] = row
	}
	for i := 0; i < n; i++ {
		matrix[i][i] = 1
	}
	return matrix
}

// IdentityValidator validates that the output matrix has 1s on the diagonal and 0s elsewhere.
//
// Parameters:
//   - r: Execution result containing inputs and outputs
//
// Returns Pass if the matrix is an identity matrix, Fail otherwise.
func IdentityValidator(r *runtime.FuzzTestResult) runtime.ValidatorResult {
	out := r.GetOut()
	if out == nil {
		return runtime.Fail
	}
	matrix, ok := out.([][]int)
	if !ok {
		return runtime.Fail
	}
	n := len(matrix)
	if n == 0 {
		return runtime.Fail
	}
	for i := 0; i < n; i++ {
		if len(matrix[i]) != n {
			return runtime.Fail
		}
		for j := 0; j < n; j++ {
			if i == j && matrix[i][j] != 1 {
				return runtime.Fail
			}
			if i != j && matrix[i][j] != 0 {
				return runtime.Fail
			}
		}
	}
	return runtime.Pass
}
