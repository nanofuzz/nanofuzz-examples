from nanofuzz_runtime import FuzzTestResult


def prime_factorize(n: int) -> list[int]:
    """Return prime factors whose product is n for 2 <= n <= 100."""
    if n <= 3:
        return [n]

    factors: list[int] = []
    divisor = 2
    while divisor * divisor <= n:
        while n % divisor == 0:
            factors.append(divisor)
            n //= divisor
        divisor += 1
    if n > 1:
        factors.append(n)
    return factors


def prime_factorize_reverse(result: FuzzTestResult) -> bool:
    """Check that multiplying the factors reconstructs the input."""
    product = 1
    for factor in result["out"]:
        product *= factor
    return product == result["in"][0]
