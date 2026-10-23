from typing import Dict, Generic, List, Optional, TypeVar

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
