from typing import Any, Generic, List, Literal, Optional, Tuple, TypeVar

T = TypeVar("T")


class CircularBuffer(Generic[T]):
    """Fixed-capacity circular FIFO buffer (ring buffer).

    A circular buffer allocates a fixed-size contiguous list and uses head and
    tail pointers to insert and remove items in FIFO order, wrapping around
    the ends using modulo arithmetic.
    """

    def __init__(self, capacity: int) -> None:
        """Initializes a new circular buffer with the specified capacity.

        Args:
            capacity: Maximum number of elements the buffer can hold.

        Raises:
            ValueError: If capacity is not a positive integer.
        """
        if not isinstance(capacity, int) or capacity <= 0:
            raise ValueError("Capacity must be a positive integer")
        self._capacity: int = capacity
        self._buffer: List[Optional[T]] = [None] * capacity
        self._head: int = 0
        self._tail: int = 0
        self._count: int = 0

    def push(self, item: T) -> bool:
        """Appends an element to the tail of the buffer.

        Args:
            item: The element to add.

        Returns:
            True if the element was added, or False if the buffer is full.
        """
        if self.is_full():
            return False
        self._buffer[self._tail] = item
        self._tail = (self._tail + 1) % self._capacity
        self._count += 1
        return True

    def pop(self) -> Optional[T]:
        """Removes and returns the oldest element at the head of the buffer.

        Returns:
            The oldest element, or None if the buffer is empty.
        """
        if self.is_empty():
            return None
        item = self._buffer[self._head]
        self._buffer[self._head] = None
        self._head = (self._head + 1) % self._capacity
        self._count -= 1
        return item

    def peek(self) -> Optional[T]:
        """Returns the oldest element at the head without removing it.

        Returns:
            The oldest element, or None if the buffer is empty.
        """
        if self.is_empty():
            return None
        return self._buffer[self._head]

    def size(self) -> int:
        """Returns the current number of elements in the buffer."""
        return self._count

    def capacity(self) -> int:
        """Returns the maximum capacity of the buffer."""
        return self._capacity

    def is_empty(self) -> bool:
        """Checks whether the buffer contains no elements."""
        return self._count == 0

    def is_full(self) -> bool:
        """Checks whether the buffer has reached maximum capacity."""
        return self._count == self._capacity

    def clear(self) -> None:
        """Resets the buffer to an empty state."""
        self._buffer = [None] * self._capacity
        self._head = 0
        self._tail = 0
        self._count = 0

    def to_list(self) -> List[T]:
        """Returns elements currently stored in the buffer in FIFO order."""
        result: List[T] = []
        for i in range(self._count):
            idx = (self._head + i) % self._capacity
            item = self._buffer[idx]
            if item is not None:
                result.append(item)
        return result


def test_circular_buffer(
    capacity: int,
    operations: List[Tuple[Literal["push", "pop", "peek", "clear"], int]],
) -> bool:
    """Test harness verifying that CircularBuffer maintains all invariants across operations."""
    if capacity <= 0 or capacity > 64:
        return True

    cb: CircularBuffer[int] = CircularBuffer(capacity)
    shadow: List[int] = []

    for op, val in operations:
        if op == "push":
            added = cb.push(val)
            if len(shadow) < capacity:
                assert added, "push failed when capacity was available"
                shadow.append(val)
            else:
                assert not added, "push succeeded when buffer was full"
        elif op == "pop":
            popped = cb.pop()
            if shadow:
                expected = shadow.pop(0)
                assert popped == expected, f"pop returned {popped}, expected {expected}"
            else:
                assert popped is None, f"pop returned {popped} on empty buffer"
        elif op == "peek":
            peeked = cb.peek()
            expected = shadow[0] if shadow else None
            assert peeked == expected, f"peek returned {peeked}, expected {expected}"
        elif op == "clear":
            cb.clear()
            shadow.clear()

        assert cb.size() == len(
            shadow), f"size {cb.size()} does not match shadow {len(shadow)}"
        assert cb.is_empty() == (len(shadow) == 0), "is_empty inconsistent with shadow length"
        assert cb.is_full() == (len(shadow) == capacity), "is_full inconsistent with capacity"
        assert cb.to_list(
        ) == shadow, f"to_list {cb.to_list()} does not match shadow {shadow}"

    return True


def test_circular_buffer_generator(
    prng: Any,
) -> Optional[Tuple[int, List[Tuple[Literal["push", "pop", "peek", "clear"], int]]]]:
    """User-provided input generator producing realistic circular buffer operation sequences."""
    cap = int(prng() * 8) + 1
    op_count = int(prng() * 10) + 1
    op_names: List[Literal["push", "pop", "peek", "clear"]] = [
        "push",
        "pop",
        "peek",
        "clear",
    ]
    ops: List[Tuple[Literal["push", "pop", "peek", "clear"], int]] = []
    for _ in range(op_count):
        op = op_names[int(prng() * len(op_names))]
        val = int(prng() * 100)
        ops.append((op, val))
    return (cap, ops)
