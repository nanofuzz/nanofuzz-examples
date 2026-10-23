import pytest
from nanofuzz_runtime import UnsatisfiedAssumption

from examples.py.expression_parser import (
    evaluate_expression,
    evaluate_expression_transformer,
)
from examples.py.lcm import lcm, lcm_validator
from examples.py.maxofarray import max_of_array
from examples.py.primefactorize import prime_factorize, prime_factorize_reverse


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


def test_expression_parser_example() -> None:
    assert evaluate_expression("2 + 3 * 4") == 14.0
    assert evaluate_expression("(2 + 3) * 4") == 20.0

    # Valid syntax passes through transformer
    assert evaluate_expression_transformer("2 + 3 * 4") == ("2 + 3 * 4",)

    # Invalid syntax raises UnsatisfiedAssumption
    with pytest.raises(UnsatisfiedAssumption):
        evaluate_expression_transformer("yo dawg")
    with pytest.raises(UnsatisfiedAssumption):
        evaluate_expression_transformer("1 + ")
    with pytest.raises(UnsatisfiedAssumption):
        evaluate_expression_transformer("(1 + 2")
