package goexamples

import (
	"strings"

	runtime "github.com/nanofuzz/nanofuzz-runtime/go"
)

// TestLRUCache is a test harness verifying that LRUCache maintains all invariants across operations.
//
// Parameters:
//   - capacity: Maximum capacity of the cache
//   - operations: Sequence of (operation, key, value) tuples to execute
//
// Returns true if all operations and invariants succeed.
func TestLRUCache(capacity int, operations []LRUOp) bool {
	if capacity <= 0 || capacity > 32 {
		return true
	}
	lru := NewLRUCache[string, int](capacity)
	var shadowKeys []string
	shadowMap := make(map[string]int)

	for _, operation := range operations {
		op := strings.ToLower(strings.TrimSpace(operation.Op))
		key := operation.Key
		val := operation.Val

		if op == "put" || strings.HasPrefix(op, "pu") || op == "+" {
			lru.Put(key, val)
			foundIdx := -1
			for idx, k := range shadowKeys {
				if k == key {
					foundIdx = idx
					break
				}
			}
			if foundIdx >= 0 {
				shadowKeys = append(shadowKeys[:foundIdx], shadowKeys[foundIdx+1:]...)
			} else if len(shadowKeys) >= capacity {
				evicted := shadowKeys[0]
				shadowKeys = shadowKeys[1:]
				delete(shadowMap, evicted)
			}
			shadowKeys = append(shadowKeys, key)
			shadowMap[key] = val
		} else if op == "get" || strings.HasPrefix(op, "g") || op == "?" {
			got, gotOk := lru.Get(key)
			expected, expectedOk := shadowMap[key]
			if gotOk != expectedOk || (gotOk && got != expected) {
				panic("get mismatch")
			}
			if expectedOk {
				for idx, k := range shadowKeys {
					if k == key {
						shadowKeys = append(shadowKeys[:idx], shadowKeys[idx+1:]...)
						shadowKeys = append(shadowKeys, key)
						break
					}
				}
			}
		} else if op == "has" || strings.HasPrefix(op, "h") {
			had := lru.Has(key)
			_, expected := shadowMap[key]
			if had != expected {
				panic("has mismatch")
			}
		} else if op == "remove" || strings.HasPrefix(op, "r") || op == "-" {
			removed := lru.Remove(key)
			_, expected := shadowMap[key]
			if removed != expected {
				panic("remove mismatch")
			}
			if expected {
				delete(shadowMap, key)
				for idx, k := range shadowKeys {
					if k == key {
						shadowKeys = append(shadowKeys[:idx], shadowKeys[idx+1:]...)
						break
					}
				}
			}
		} else if op == "clear" || strings.HasPrefix(op, "cl") {
			lru.Clear()
			shadowKeys = nil
			shadowMap = make(map[string]int)
		}

		if lru.Size() != len(shadowKeys) {
			panic("size mismatch")
		}
		if lru.IsEmpty() != (len(shadowKeys) == 0) {
			panic("is_empty mismatch")
		}
		keys := lru.Keys()
		if len(keys) != len(shadowKeys) {
			panic("keys length mismatch")
		}
		for i := range keys {
			if keys[i] != shadowKeys[i] {
				panic("keys order mismatch")
			}
		}
	}

	return true
}

// TestLRUCacheGenerator produces realistic LRU cache operation sequences for fuzz testing.
//
// Parameters:
//   - prng: Seeded pseudo-random number generator function returning [0, 1)
//
// Returns a cache capacity and a slice of LRU operations.
func TestLRUCacheGenerator(prng func() float64) (int, []LRUOp) {
	runtime.Assume(prng != nil)
	cap := int(prng()*4.0) + 1
	opCount := int(prng()*10.0) + 1
	opNames := []string{"put", "get", "has", "remove", "clear"}
	keyNames := []string{"k1", "k2", "k3", "k4"}
	ops := make([]LRUOp, opCount)
	for i := 0; i < opCount; i++ {
		opIdx := int(prng() * float64(len(opNames)))
		keyIdx := int(prng() * float64(len(keyNames)))
		ops[i] = LRUOp{
			Op:  opNames[opIdx],
			Key: keyNames[keyIdx],
			Val: int(prng() * 100.0),
		}
	}
	return cap, ops
}

// LRUCache is a Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.
//
// When the number of stored entries reaches capacity, adding a new key
// evicts the least recently accessed (retrieved or inserted) entry.
type LRUCache[K comparable, V any] struct {
	cache map[K]V
	order []K
	cap   int
}

// NewLRUCache creates a new LRU cache with the specified capacity limit.
//
// Panics if capacity <= 0.
func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
	if capacity <= 0 {
		panic("capacity must be greater than zero")
	}
	return &LRUCache[K, V]{
		cache: make(map[K]V, capacity),
		order: make([]K, 0, capacity),
		cap:   capacity,
	}
}

// Get looks up a value by key and marks it as the most recently accessed entry.
// Returns (zero, false) if the key is not in the cache.
func (lru *LRUCache[K, V]) Get(key K) (V, bool) {
	val, ok := lru.cache[key]
	if !ok {
		var zero V
		return zero, false
	}
	for i, k := range lru.order {
		if k == key {
			lru.order = append(lru.order[:i], lru.order[i+1:]...)
			lru.order = append(lru.order, key)
			break
		}
	}
	return val, true
}

// Put inserts or updates a key-value pair.
//
// If the key exists, its value is updated and recency is refreshed.
// If the key is new and the cache is at capacity, the oldest entry is evicted.
func (lru *LRUCache[K, V]) Put(key K, value V) {
	if _, ok := lru.cache[key]; ok {
		for i, k := range lru.order {
			if k == key {
				lru.order = append(lru.order[:i], lru.order[i+1:]...)
				break
			}
		}
	} else if len(lru.order) >= lru.cap {
		oldest := lru.order[0]
		lru.order = lru.order[1:]
		delete(lru.cache, oldest)
	}
	lru.order = append(lru.order, key)
	lru.cache[key] = value
}

// Has checks whether a key is present without updating its recency.
func (lru *LRUCache[K, V]) Has(key K) bool {
	_, ok := lru.cache[key]
	return ok
}

// Remove removes a key and its value from the cache.
// Returns true if the key was present and removed, false otherwise.
func (lru *LRUCache[K, V]) Remove(key K) bool {
	if _, ok := lru.cache[key]; !ok {
		return false
	}
	delete(lru.cache, key)
	for i, k := range lru.order {
		if k == key {
			lru.order = append(lru.order[:i], lru.order[i+1:]...)
			break
		}
	}
	return true
}

// Size returns the current number of entries stored in the cache.
func (lru *LRUCache[K, V]) Size() int {
	return len(lru.order)
}

// Capacity returns the maximum capacity of the cache.
func (lru *LRUCache[K, V]) Capacity() int {
	return lru.cap
}

// IsEmpty returns true if the cache contains no entries.
func (lru *LRUCache[K, V]) IsEmpty() bool {
	return len(lru.order) == 0
}

// Clear removes all entries from the cache.
func (lru *LRUCache[K, V]) Clear() {
	lru.cache = make(map[K]V, lru.cap)
	lru.order = nil
}

// Keys returns all keys ordered from least recently used to most recently used.
func (lru *LRUCache[K, V]) Keys() []K {
	res := make([]K, len(lru.order))
	copy(res, lru.order)
	return res
}

// LRUOp represents a tuple of (operation, key, value) for cache testing.
type LRUOp struct {
	Op  string
	Key string
	Val int
}
