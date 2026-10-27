from typing import List
from nanofuzz_runtime import FuzzTestResult


def identity(n: int) -> List[List[int]]:
    """Return an identity matrix of size n x n.

    Adapted from: https://rosettacode.org/wiki/Identity_matrix#TypeScript

    This function returns an identity matrix of n x n size such that:
      n = 1 => [[1]],
      n = 2 => [[1,0],[0,1]],
      n = 3 => [[1,0,0],[0,1,0],[0,0,1]],
      ... and so on ...

    Args:
        n: Finite integer >= 1.

    Returns:
        List[List[int]] identity matrix of size n x n.
    """
    if n <= 0:
        return []
    # Bug from RosettaCode / TypeScript example: all rows share the same list reference
    row = [0] * n
    matrix = [row] * n
    for i in range(n):
        matrix[i][i] = 1
    return matrix


def identity_validator(r: FuzzTestResult) -> bool:
    """Validate that the matrix is an identity matrix."""
    output = r.get("out")
    if not isinstance(output, list) or len(output) == 0:
        return False
    n = len(output)
    for i in range(n):
        if not isinstance(output[i], list) or len(output[i]) != n:
            return False
        for j in range(n):
            if i == j and output[i][j] != 1:
                return False
            if i != j and output[i][j] != 0:
                return False
    return True
