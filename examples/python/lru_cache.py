from __future__ import annotations

import random
from typing import Callable, Dict, Generic, List, Literal, Optional, Tuple, TypeVar


#
# Test harness verifying that LRUCache maintains all invariants across
# a sequence of operations.
#
# @param capacity Maximum capacity of the cache (1-32)
# @param operations Sequence of [operation, key, value] tuples to execute
# @returns True if all operations and invariants succeed
#
def test_lru_cache(
    capacity: int,
    operations: List[Tuple[Literal["put", "get", "has", "remove", "clear"], str, int]],
) -> bool:
    """Test harness verifying that LRUCache maintains all invariants across operations.

    Args:
        capacity: Maximum capacity of the LRU cache (1-32).
        operations: Sequence of (operation, key, value) tuples to execute.

    Returns:
        True if all operations and invariants succeed.
    """
    if capacity <= 0 or capacity > 32:
        return True

    lru: LRUCache[str, int] = LRUCache(capacity)
    shadow: Dict[str, int] = {}

    for op, key, val in operations:
        if op == "put":
            lru.put(key, val)
            if key in shadow:
                del shadow[key]
            elif len(shadow) >= capacity:
                oldest = next(iter(shadow))
                del shadow[oldest]
            shadow[key] = val
        elif op == "get":
            got = lru.get(key)
            expected = shadow.get(key)
            assert got == expected, f"get({key}) returned {got}, expected {expected}"
            if expected is not None:
                del shadow[key]
                shadow[key] = expected
        elif op == "has":
            had = lru.has(key)
            expected = key in shadow
            assert had == expected, f"has({key}) returned {had}, expected {expected}"
        elif op == "remove":
            removed = lru.remove(key)
            expected = key in shadow
            if expected:
                del shadow[key]
            assert removed == expected, f"remove({key}) returned {removed}, expected {expected}"
        elif op == "clear":
            lru.clear()
            shadow.clear()

        assert lru.size() == len(
            shadow), f"size {lru.size()} does not match shadow {len(shadow)}"
        assert lru.is_empty() == (len(shadow) == 0), "is_empty inconsistent with shadow size"
        keys = lru.keys()
        shadow_keys = list(shadow.keys())
        assert keys == shadow_keys, f"keys {keys} does not match shadow keys {shadow_keys}"

    return True


#
# User-provided input generator producing realistic LRU cache operation sequences.
#
def test_lru_cache_generator(
    prng: Callable[[], float],
) -> Optional[Tuple[int, List[Tuple[Literal["put", "get", "has", "remove", "clear"], str, int]]]]:
    """User-provided input generator producing realistic LRU cache operation sequences.

    Args:
        prng: Pseudo-random number generator function returning float values in [0.0, 1.0).

    Returns:
        A tuple of (capacity, operations) or None when exhausted.
    """
    rng = prng if callable(prng) else random.Random(prng).random
    cap = int(rng() * 4) + 1
    op_count = int(rng() * 10) + 1
    op_names: List[Literal["put", "get", "has", "remove", "clear"]] = [
        "put",
        "get",
        "has",
        "remove",
        "clear",
    ]
    key_names = ["k1", "k2", "k3", "k4"]
    ops: List[Tuple[Literal["put", "get", "has", "remove", "clear"], str, int]] = []
    for _ in range(op_count):
        op = op_names[int(rng() * len(op_names))]
        key = key_names[int(rng() * len(key_names))]
        val = int(rng() * 100)
        ops.append((op, key, val))
    return (cap, ops)


K = TypeVar("K")
V = TypeVar("V")


class LRUCache(Generic[K, V]):
    """Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.

    Entries accessed or inserted most recently are retained. When capacity is
    exceeded on insertion, the least recently used entry is evicted.
    """

    def __init__(self, capacity: int) -> None:
        """Initializes a new LRU cache with the given capacity limit.

        Args:
            capacity: Maximum number of entries the cache can hold.

        Raises:
            ValueError: If capacity is not a positive integer.
        """
        if not isinstance(capacity, int) or capacity <= 0:
            raise ValueError("Capacity must be a positive integer")
        self._capacity: int = capacity
        self._cache: Dict[K, V] = {}

    def get(self, key: K) -> Optional[V]:
        """Looks up a value by key and marks it as the most recently used entry.

        Args:
            key: The key to retrieve.

        Returns:
            The associated value, or None if the key is not in the cache.
        """
        if key not in self._cache:
            return None
        val = self._cache.pop(key)
        self._cache[key] = val
        return val

    def put(self, key: K, value: V) -> None:
        """Inserts or updates a key-value pair.

        If the key exists, its value is updated and recency is refreshed.
        If the key is new and capacity is reached, the least recently used
        item is evicted.

        Args:
            key: The key to store.
            value: The value to associate with the key.
        """
        if key in self._cache:
            self._cache.pop(key)
        elif len(self._cache) >= self._capacity:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        self._cache[key] = value

    def has(self, key: K) -> bool:
        """Checks whether a key exists in the cache without updating its recency.

        Args:
            key: The key to check.

        Returns:
            True if present, False otherwise.
        """
        return key in self._cache

    def remove(self, key: K) -> bool:
        """Removes a key and its value from the cache.

        Args:
            key: The key to remove.

        Returns:
            True if the key was present and removed, False otherwise.
        """
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    def size(self) -> int:
        """Returns the number of entries currently stored."""
        return len(self._cache)

    def capacity(self) -> int:
        """Returns the maximum capacity limit."""
        return self._capacity

    def is_empty(self) -> bool:
        """Checks whether the cache contains no entries."""
        return len(self._cache) == 0

    def clear(self) -> None:
        """Removes all entries from the cache."""
        self._cache.clear()

    def keys(self) -> List[K]:
        """Returns all keys ordered from least recently used to most recently used."""
        return list(self._cache.keys())
