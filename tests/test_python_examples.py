import pytest
from nanofuzz_runtime import UnsatisfiedAssumption

from examples.python.circular_buffer import CircularBuffer
from examples.python.expression_parser import (
    evaluate_expression,
    evaluate_expression_transformer,
)
from examples.python.lcm import lcm, lcm_validator
from examples.python.lru_cache import LRUCache
from examples.python.maxofarray import max_of_array
from examples.python.min_stack import MinStack
from examples.python.primefactorize import prime_factorize, prime_factorize_reverse


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


def test_circular_buffer_example() -> None:
    with pytest.raises(ValueError):
        CircularBuffer(0)

    cb: CircularBuffer[int] = CircularBuffer(3)
    assert cb.is_empty() is True
    assert cb.push(10) is True
    assert cb.push(20) is True
    assert cb.push(30) is True
    assert cb.push(40) is False  # full
    assert cb.is_full() is True
    assert cb.size() == 3
    assert cb.peek() == 10
    assert cb.pop() == 10
    assert cb.push(40) is True  # wrap-around push
    assert cb.to_list() == [20, 30, 40]
    assert cb.pop() == 20
    assert cb.pop() == 30
    assert cb.pop() == 40
    assert cb.pop() is None
    assert cb.is_empty() is True


def test_min_stack_example() -> None:
    ms: MinStack[float] = MinStack()
    assert ms.is_empty() is True
    assert ms.get_min() is None
    assert ms.pop() is None

    ms.push(5.0)
    assert ms.get_min() == 5.0
    ms.push(3.0)
    assert ms.get_min() == 3.0
    ms.push(7.0)
    assert ms.get_min() == 3.0
    ms.push(3.0)
    assert ms.get_min() == 3.0

    assert ms.top() == 3.0
    assert ms.pop() == 3.0
    assert ms.get_min() == 3.0  # duplicate min preserved
    assert ms.pop() == 7.0
    assert ms.get_min() == 3.0
    assert ms.pop() == 3.0
    assert ms.get_min() == 5.0
    assert ms.size() == 1
    assert ms.pop() == 5.0
    assert ms.is_empty() is True


def test_lru_cache_example() -> None:
    with pytest.raises(ValueError):
        LRUCache(0)

    lru: LRUCache[str, int] = LRUCache(2)
    lru.put("a", 1)
    lru.put("b", 2)
    assert lru.get("a") == 1  # "a" is now MRU, "b" is LRU
    lru.put("c", 3)  # evicts "b"
    assert lru.has("b") is False
    assert lru.get("b") is None
    assert lru.get("c") == 3
    assert lru.get("a") == 1
    assert lru.keys() == ["c", "a"]
    assert lru.remove("c") is True
    assert lru.size() == 1
