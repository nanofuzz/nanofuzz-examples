from typing import Generic, List, Optional, TypeVar

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
