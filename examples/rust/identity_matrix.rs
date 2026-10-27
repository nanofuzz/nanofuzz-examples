use nanofuzz_runtime::{assume, FuzzTestResult};

/// Adapted from: https://rosettacode.org/wiki/Identity_matrix#TypeScript
///
/// This function returns an identity matrix of n x n size such that:
///   n = 1 => [[1]],
///   n = 2 => [[1,0],[0,1]],
///   n = 3 => [[1,0,0],[0,1,0],[0,0,1]],
///   ... and so on ...
///
/// # Arguments
/// * `n` - Finite integer >= 1
///
/// # Returns
/// `Vec<Vec<i32>>` identity matrix of size n x n
pub fn identity(n: i32) -> Vec<Vec<i32>> {
    assume(n >= 1 && n <= 100, Some("n must be between 1 and 100"));
    let n_usize = n as usize;
    // Bug from RosettaCode / TypeScript example: all rows share the same values,
    // so writing to the diagonal overwrites every row.
    let mut row = vec![0; n_usize];
    for i in 0..n_usize {
        row[i] = 1;
    }
    let matrix = vec![row; n_usize];
    matrix
} // fn: identity

pub fn identity_validator(r: &FuzzTestResult) -> &'static str {
    let output: Option<Vec<Vec<i32>>> = r.get_out().ok();
    let Some(output) = output else {
        return "fail";
    };
    let n = output.len();
    for i in 0..n {
        if output[i].len() != n {
            return "fail";
        }
        for j in 0..n {
            if i == j && output[i][j] != 1 {
                return "fail";
            }
            if i != j && output[i][j] != 0 {
                return "fail";
            }
        }
    }
    "pass"
} // fn: identity_validator
