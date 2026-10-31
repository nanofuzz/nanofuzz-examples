package goexamples

import (
	"strings"

	runtime "github.com/nanofuzz/nanofuzz-runtime/go"
)

// TestMinStack is a test harness verifying that MinStack maintains all invariants across operations.
//
// Parameters:
//   - operations: Sequence of (operation, value) pairs to execute
//
// Returns true if all operations and invariants succeed.
func TestMinStack(operations []StackOp) bool {
	ms := NewMinStack[int]()
	var shadow []int

	for _, operation := range operations {
		op := strings.ToLower(strings.TrimSpace(operation.Op))
		val := operation.Val

		if op == "push" || strings.HasPrefix(op, "pu") || op == "+" {
			ms.Push(val)
			shadow = append(shadow, val)
		} else if op == "pop" || strings.HasPrefix(op, "po") || op == "-" {
			popped, ok := ms.Pop()
			if len(shadow) > 0 {
				expected := shadow[len(shadow)-1]
				shadow = shadow[:len(shadow)-1]
				if !ok || popped != expected {
					panic("pop mismatch")
				}
			} else {
				if ok {
					panic("pop on empty stack")
				}
			}
		} else if op == "top" || strings.HasPrefix(op, "t") || op == "?" {
			topped, ok := ms.Top()
			if len(shadow) > 0 {
				expected := shadow[len(shadow)-1]
				if !ok || topped != expected {
					panic("top mismatch")
				}
			} else {
				if ok {
					panic("top on empty stack")
				}
			}
		} else if op == "min" || strings.HasPrefix(op, "m") || strings.Contains(op, "min") {
			minVal, ok := ms.GetMin()
			if len(shadow) > 0 {
				expected := shadow[0]
				for _, v := range shadow[1:] {
					if v < expected {
						expected = v
					}
				}
				if !ok || minVal != expected {
					panic("get_min mismatch")
				}
			} else {
				if ok {
					panic("get_min on empty stack")
				}
			}
		} else if op == "clear" || strings.HasPrefix(op, "cl") {
			ms.Clear()
			shadow = nil
		}

		if ms.Size() != len(shadow) {
			panic("size mismatch")
		}
		if ms.IsEmpty() != (len(shadow) == 0) {
			panic("is_empty mismatch")
		}
		currentMin, ok := ms.GetMin()
		if len(shadow) > 0 {
			expectedMin := shadow[0]
			for _, v := range shadow[1:] {
				if v < expectedMin {
					expectedMin = v
				}
			}
			if !ok || currentMin != expectedMin {
				panic("invariant get_min mismatch")
			}
		} else {
			if ok {
				panic("invariant get_min on empty stack")
			}
		}
	}

	return true
}

// TestMinStackGenerator produces realistic MinStack operation sequences for fuzz testing.
//
// Parameters:
//   - prng: Seeded pseudo-random number generator function returning [0, 1)
//
// Returns a slice of stack operations.
func TestMinStackGenerator(prng func() float64) []StackOp {
	runtime.Assume(prng != nil)
	opCount := int(prng()*10.0) + 1
	opNames := []string{"push", "pop", "top", "min", "clear"}
	ops := make([]StackOp, opCount)
	for i := 0; i < opCount; i++ {
		opIdx := int(prng() * float64(len(opNames)))
		ops[i] = StackOp{
			Op:  opNames[opIdx],
			Val: int(prng()*200.0) - 100,
		}
	}
	return ops
}

// MinStack is a LIFO stack supporting O(1) push, pop, top, and get_min operations.
//
// A parallel slice of running minimums is kept in sync with the elements slice,
// allowing constant-time retrieval of the minimum value.
type MinStack[T Ordered] struct {
	elements    []T
	minElements []T
}

// NewMinStack creates a new, empty MinStack.
func NewMinStack[T Ordered]() *MinStack[T] {
	return &MinStack[T]{}
}

// Push adds an element to the stack and updates the running minimum.
//
// Parameters:
//   - val: Value to push onto the stack
func (ms *MinStack[T]) Push(val T) {
	currentMin := val
	if len(ms.minElements) > 0 {
		lastMin := ms.minElements[len(ms.minElements)-1]
		if lastMin < val {
			currentMin = lastMin
		}
	}
	ms.elements = append(ms.elements, val)
	ms.minElements = append(ms.minElements, currentMin)
}

// Pop removes and returns the top element from the stack.
// Returns (zero, false) if the stack is empty.
func (ms *MinStack[T]) Pop() (T, bool) {
	var zero T
	if ms.IsEmpty() {
		return zero, false
	}
	n := len(ms.elements) - 1
	item := ms.elements[n]
	ms.elements = ms.elements[:n]
	ms.minElements = ms.minElements[:n]
	return item, true
}

// Top returns the top element without removing it.
// Returns (zero, false) if the stack is empty.
func (ms *MinStack[T]) Top() (T, bool) {
	var zero T
	if ms.IsEmpty() {
		return zero, false
	}
	return ms.elements[len(ms.elements)-1], true
}

// GetMin returns the minimum element currently on the stack in O(1) time.
// Returns (zero, false) if the stack is empty.
func (ms *MinStack[T]) GetMin() (T, bool) {
	var zero T
	if ms.IsEmpty() {
		return zero, false
	}
	return ms.minElements[len(ms.minElements)-1], true
}

// Size returns the count of elements currently on the stack.
func (ms *MinStack[T]) Size() int {
	return len(ms.elements)
}

// IsEmpty returns true if the stack contains no elements.
func (ms *MinStack[T]) IsEmpty() bool {
	return len(ms.elements) == 0
}

// Clear removes all elements from the stack.
func (ms *MinStack[T]) Clear() {
	ms.elements = nil
	ms.minElements = nil
}

// ToSlice returns a copy of elements from bottom to top.
func (ms *MinStack[T]) ToSlice() []T {
	res := make([]T, len(ms.elements))
	copy(res, ms.elements)
	return res
}

// Ordered is a constraint for types that support the <, <=, >, >= comparison operators.
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
		~float32 | ~float64 | ~string
}

// StackOp represents an operation and value pair for MinStack testing.
type StackOp struct {
	Op  string
	Val int
}
