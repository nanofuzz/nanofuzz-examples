from __future__ import annotations

import random
from typing import Callable, Generic, List, Literal, Optional, Tuple, TypeVar


#
# Test harness verifying that MinStack maintains all invariants across
# a sequence of operations.
#
# @param operations Sequence of (operation, value) pairs to execute
# @returns True if all operations and invariants succeed
#
def test_min_stack(
    operations: List[Tuple[Literal["push", "pop", "top", "min", "clear"], int]],
) -> bool:
    """Test harness verifying that MinStack maintains all invariants across operations.

    Args:
        operations: Sequence of (operation, value) pairs to execute.

    Returns:
        True if all operations and invariants succeed.
    """
    ms: MinStack[int] = MinStack()
    shadow: List[int] = []

    for op, val in operations:
        if op == "push":
            ms.push(val)
            shadow.append(val)
        elif op == "pop":
            popped = ms.pop()
            expected = shadow.pop() if shadow else None
            assert popped == expected, f"pop returned {popped}, expected {expected}"
        elif op == "top":
            topped = ms.top()
            expected = shadow[-1] if shadow else None
            assert topped == expected, f"top returned {topped}, expected {expected}"
        elif op == "min":
            min_val = ms.get_min()
            expected = min(shadow) if shadow else None
            assert min_val == expected, f"get_min returned {min_val}, expected {expected}"
        elif op == "clear":
            ms.clear()
            shadow.clear()

        assert ms.size() == len(
            shadow), f"size {ms.size()} mismatch with shadow {len(shadow)}"
        assert ms.is_empty() == (len(shadow) == 0), "is_empty inconsistent with shadow length"
        current_min = ms.get_min()
        expected_min = min(shadow) if shadow else None
        assert current_min == expected_min, f"invariant get_min {current_min} != expected {expected_min}"

    return True


#
# User-provided input generator producing realistic MinStack operation sequences.
#
def test_min_stack_generator(
    prng: Callable[[], float],
) -> Optional[Tuple[List[Tuple[Literal["push", "pop", "top", "min", "clear"], int]]]]:
    """User-provided input generator producing realistic MinStack operation sequences.

    Args:
        prng: Pseudo-random number generator function returning float values in [0.0, 1.0).

    Returns:
        A tuple containing a list of operations for test_min_stack, or None when exhausted.
    """
    rng = prng if callable(prng) else random.Random(prng).random
    op_count = int(rng() * 10) + 1
    op_names: List[Literal["push", "pop", "top", "min", "clear"]] = [
        "push",
        "pop",
        "top",
        "min",
        "clear",
    ]
    ops: List[Tuple[Literal["push", "pop", "top", "min", "clear"], int]] = []
    for _ in range(op_count):
        op = op_names[int(rng() * len(op_names))]
        val = int(rng() * 200) - 100
        ops.append((op, val))
    return (ops,)


T = TypeVar("T")


class MinStack(Generic[T]):
    """LIFO Stack that supports push, pop, top, and retrieving the minimum element in O(1) time.

    An auxiliary stack of prefix minimums is maintained in lockstep with the
    elements stack so that minimum lookups require no traversal.
    """

    def __init__(self) -> None:
        """Initializes an empty MinStack."""
        self._elements: List[T] = []
        self._min_elements: List[T] = []

    def push(self, val: T) -> None:
        """Pushes a value onto the stack and updates the running minimum.

        Args:
            val: The value to push.
        """
        current_min = (
            val
            if not self._min_elements
            else (val if val < self._min_elements[-1] else self._min_elements[-1])
        )
        self._elements.append(val)
        self._min_elements.append(current_min)

    def pop(self) -> Optional[T]:
        """Removes and returns the top element from the stack.

        Returns:
            The removed element, or None if the stack is empty.
        """
        if self.is_empty():
            return None
        self._min_elements.pop()
        return self._elements.pop()

    def top(self) -> Optional[T]:
        """Returns the top element without removing it.

        Returns:
            The top element, or None if the stack is empty.
        """
        if self.is_empty():
            return None
        return self._elements[-1]

    def get_min(self) -> Optional[T]:
        """Retrieves the minimum element currently in the stack in O(1) time.

        Returns:
            The minimum element, or None if the stack is empty.
        """
        if self.is_empty():
            return None
        return self._min_elements[-1]

    def size(self) -> int:
        """Returns the number of elements on the stack."""
        return len(self._elements)

    def is_empty(self) -> bool:
        """Checks whether the stack contains no elements."""
        return len(self._elements) == 0

    def clear(self) -> None:
        """Removes all elements from the stack."""
        self._elements.clear()
        self._min_elements.clear()

    def to_list(self) -> List[T]:
        """Returns a copy of elements from bottom to top."""
        return list(self._elements)
