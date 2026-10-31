package goexamples

import (
	"strings"

	runtime "github.com/nanofuzz/nanofuzz-runtime/go"
)

// TestCircularBuffer is a test harness verifying that CircularBuffer maintains all invariants across operations.
//
// Parameters:
//   - capacity: Maximum capacity of the circular buffer
//   - operations: Sequence of (operation, value) pairs to execute
//
// Returns true if all operations and invariants succeed.
func TestCircularBuffer(capacity int, operations []Op) bool {
	if capacity <= 0 || capacity > 64 {
		return true
	}
	cb := NewCircularBuffer[int](capacity)
	var shadow []int

	for _, operation := range operations {
		op := strings.ToLower(strings.TrimSpace(operation.Op))
		val := operation.Val

		if op == "push" || strings.HasPrefix(op, "pu") || op == "+" {
			added := cb.Push(val)
			if len(shadow) < capacity {
				if !added {
					panic("push failed when capacity was available")
				}
				shadow = append(shadow, val)
			} else {
				if added {
					panic("push succeeded when buffer was full")
				}
			}
		} else if op == "pop" || strings.HasPrefix(op, "po") || op == "-" {
			popped, ok := cb.Pop()
			if len(shadow) > 0 {
				expected := shadow[0]
				shadow = shadow[1:]
				if !ok || popped != expected {
					panic("pop mismatch")
				}
			} else {
				if ok {
					panic("pop on empty buffer")
				}
			}
		} else if op == "peek" || strings.HasPrefix(op, "pe") || op == "?" {
			peeked, ok := cb.Peek()
			if len(shadow) > 0 {
				expected := shadow[0]
				if !ok || peeked != expected {
					panic("peek mismatch")
				}
			} else {
				if ok {
					panic("peek on empty buffer")
				}
			}
		} else if op == "clear" || strings.HasPrefix(op, "cl") {
			cb.Clear()
			shadow = nil
		}

		if cb.Size() != len(shadow) {
			panic("size mismatch")
		}
		if cb.IsEmpty() != (len(shadow) == 0) {
			panic("is_empty mismatch")
		}
		if cb.IsFull() != (len(shadow) == capacity) {
			panic("is_full mismatch")
		}
		slice := cb.ToSlice()
		if len(slice) != len(shadow) {
			panic("to_slice length mismatch")
		}
		for i := range slice {
			if slice[i] != shadow[i] {
				panic("to_slice value mismatch")
			}
		}
	}

	return true
}

// TestCircularBufferGenerator produces realistic circular buffer operation sequences for fuzz testing.
//
// Parameters:
//   - prng: Seeded pseudo-random number generator function returning [0, 1)
//
// Returns an initial buffer capacity and a sequence of operations.
func TestCircularBufferGenerator(prng func() float64) (int, []Op) {
	runtime.Assume(prng != nil)
	cap := int(prng()*8.0) + 1
	opCount := int(prng()*10.0) + 1
	opNames := []string{"push", "pop", "peek", "clear"}
	ops := make([]Op, opCount)
	for i := 0; i < opCount; i++ {
		opIdx := int(prng() * float64(len(opNames)))
		ops[i] = Op{
			Op:  opNames[opIdx],
			Val: int(prng() * 100.0),
		}
	}
	return cap, ops
}

// CircularBuffer is a fixed-capacity circular FIFO buffer (ring buffer).
//
// Allocates a contiguous slice and uses head and tail indices with modulo
// arithmetic to achieve constant-time push, pop, and peek operations.
type CircularBuffer[T any] struct {
	buffer []T
	head   int
	tail   int
	count  int
	cap    int
}

// NewCircularBuffer creates a new circular buffer with the specified maximum capacity.
//
// Panics if capacity <= 0.
func NewCircularBuffer[T any](capacity int) *CircularBuffer[T] {
	if capacity <= 0 {
		panic("capacity must be greater than zero")
	}
	return &CircularBuffer[T]{
		buffer: make([]T, capacity),
		head:   0,
		tail:   0,
		count:  0,
		cap:    capacity,
	}
}

// Push appends an element to the tail of the buffer. Returns false if full.
func (cb *CircularBuffer[T]) Push(item T) bool {
	if cb.IsFull() {
		return false
	}
	cb.buffer[cb.tail] = item
	cb.tail = (cb.tail + 1) % cb.cap
	cb.count++
	return true
}

// Pop removes and returns the oldest element at the head of the buffer.
// Returns (zero, false) if the buffer is empty.
func (cb *CircularBuffer[T]) Pop() (T, bool) {
	var zero T
	if cb.IsEmpty() {
		return zero, false
	}
	item := cb.buffer[cb.head]
	cb.buffer[cb.head] = zero
	cb.head = (cb.head + 1) % cb.cap
	cb.count--
	return item, true
}

// Peek returns the oldest element at the head without removing it.
// Returns (zero, false) if the buffer is empty.
func (cb *CircularBuffer[T]) Peek() (T, bool) {
	var zero T
	if cb.IsEmpty() {
		return zero, false
	}
	return cb.buffer[cb.head], true
}

// Size returns the number of elements currently stored in the buffer.
func (cb *CircularBuffer[T]) Size() int {
	return cb.count
}

// Capacity returns the maximum capacity of the buffer.
func (cb *CircularBuffer[T]) Capacity() int {
	return cb.cap
}

// IsEmpty returns true if the buffer contains no elements.
func (cb *CircularBuffer[T]) IsEmpty() bool {
	return cb.count == 0
}

// IsFull returns true if the buffer has reached maximum capacity.
func (cb *CircularBuffer[T]) IsFull() bool {
	return cb.count == cb.cap
}

// Clear resets the buffer to an empty state, clearing all stored elements.
func (cb *CircularBuffer[T]) Clear() {
	var zero T
	for i := range cb.buffer {
		cb.buffer[i] = zero
	}
	cb.head = 0
	cb.tail = 0
	cb.count = 0
}

// ToSlice returns all elements in FIFO order (head to tail).
func (cb *CircularBuffer[T]) ToSlice() []T {
	result := make([]T, cb.count)
	for i := 0; i < cb.count; i++ {
		idx := (cb.head + i) % cb.cap
		result[i] = cb.buffer[idx]
	}
	return result
}

// Op represents a circular buffer operation and an associated value.
type Op struct {
	Op  string
	Val int
}
