from examples.lcm import lcm, lcm_validator
from examples.maxofarray import max_of_array
from examples.primefactorize import prime_factorize, prime_factorize_reverse


def test_lcm_example() -> None:
    assert lcm(2, 10) == 10
    assert lcm_validator(
        {"in": [2, 10], "out": 10, "exception": False, "timeout": False}
    )


def test_max_of_array_example() -> None:
    assert max_of_array([1.0, 7.5, -3.0]) == 7.5


def test_prime_factorize_example() -> None:
    assert prime_factorize(20) == [2, 2, 5]
    assert prime_factorize_reverse(
        {"in": [20], "out": [2, 2, 5], "exception": False, "timeout": False}
    )
