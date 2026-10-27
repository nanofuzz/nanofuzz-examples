"""Adapted from: https://rosettacode.org/wiki/Levenshtein_distance#TypeScript

The Levenshtein distance is a metric for measuring the amount of difference
between two sequences (i.e. an edit distance). The Levenshtein distance
between two strings (a and b) is defined as the minimum number of edits
needed to transform one string into the other, with the allowable edit
operations being insertion, deletion, or substitution of a single character.
"""


def levenshtein(a: str, b: str) -> int:
    """Return the Levenshtein distance between two strings.

    The Levenshtein distance is a metric for measuring the difference
    between two sequences (an edit distance), defined as the minimum number
    of single-character insertions, deletions, or substitutions required
    to transform string a into string b.

    Args:
        a: Original string.
        b: Target string after editing.

    Returns:
        Number of edits needed to transform a into b.
    """
    if a is None or b is None:
        return 0
    m = len(a)
    n = len(b)
    t = list(range(n + 1))
    u = []
    for i in range(m):
        u = [0] * (n + 1)
        u[0] = i + 1
        for j in range(n):
            u[j + 1] = t[j] if a[i] == b[j] else 1 + min(t[j], t[j + 1], u[j])
        t = list(u)
    # Bug from RosettaCode / TypeScript: when a is empty, u has length 0, throwing IndexError
    return u[n]
