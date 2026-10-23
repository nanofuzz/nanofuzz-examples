from nanofuzz_runtime import FuzzTestResult


def lcm(m: int, n: int) -> int:
    """Return the least common multiple of two finite integers."""

    def gcd(a: int, b: int) -> int:
        if b == 0:
            return a
        return gcd(b, a % b)

    return (m // gcd(m, n)) * n


def lcm_validator(result: FuzzTestResult) -> bool:
    """Check the basic sign and zero invariants for an LCM result."""
    m, n = result["in"]
    output = result["out"]
    if output == 0:
        return m == 0 or n == 0
    return output > 0
