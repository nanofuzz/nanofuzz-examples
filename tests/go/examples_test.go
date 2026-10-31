package goexamples_test

import (
	"testing"

	goexamples "github.com/nanofuzz/nanofuzz-examples/examples/go"
	runtime "github.com/nanofuzz/nanofuzz-runtime/go"
)

func TestCircularBuffer(t *testing.T) {
	cb := goexamples.NewCircularBuffer[int](3)
	if !cb.IsEmpty() {
		t.Fatal("expected empty")
	}
	if !cb.Push(10) || !cb.Push(20) || !cb.Push(30) {
		t.Fatal("expected push to succeed")
	}
	if cb.Push(40) {
		t.Fatal("expected push to fail when full")
	}
	if !cb.IsFull() || cb.Size() != 3 {
		t.Fatal("expected full and size 3")
	}
	if peeked, ok := cb.Peek(); !ok || peeked != 10 {
		t.Fatalf("expected peek 10, got %v", peeked)
	}
	if popped, ok := cb.Pop(); !ok || popped != 10 {
		t.Fatalf("expected pop 10, got %v", popped)
	}
	if !cb.Push(40) {
		t.Fatal("expected wrap-around push to succeed")
	}
	slice := cb.ToSlice()
	expected := []int{20, 30, 40}
	for i, v := range expected {
		if slice[i] != v {
			t.Fatalf("at %d: expected %d, got %d", i, v, slice[i])
		}
	}
}

func TestCircularBufferHarness(t *testing.T) {
	ok := goexamples.TestCircularBuffer(3, []goexamples.Op{
		{Op: "push", Val: 10},
		{Op: "push", Val: 20},
		{Op: "pop", Val: 0},
		{Op: "clear", Val: 0},
	})
	if !ok {
		t.Fatal("expected test harness to return true")
	}
}

func TestMinStack(t *testing.T) {
	ms := goexamples.NewMinStack[int]()
	if !ms.IsEmpty() {
		t.Fatal("expected empty")
	}
	ms.Push(5)
	ms.Push(3)
	ms.Push(7)
	ms.Push(3)

	if m, ok := ms.GetMin(); !ok || m != 3 {
		t.Fatalf("expected min 3, got %v", m)
	}
	if top, ok := ms.Top(); !ok || top != 3 {
		t.Fatalf("expected top 3, got %v", top)
	}
	if popped, ok := ms.Pop(); !ok || popped != 3 {
		t.Fatalf("expected pop 3, got %v", popped)
	}
	if m, ok := ms.GetMin(); !ok || m != 3 {
		t.Fatalf("expected min 3 after popping duplicate, got %v", m)
	}
	ms.Pop() // 7
	ms.Pop() // 3
	if m, ok := ms.GetMin(); !ok || m != 5 {
		t.Fatalf("expected min 5, got %v", m)
	}
}

func TestMinStackHarness(t *testing.T) {
	ok := goexamples.TestMinStack([]goexamples.StackOp{
		{Op: "push", Val: 5},
		{Op: "push", Val: 2},
		{Op: "min", Val: 0},
		{Op: "pop", Val: 0},
	})
	if !ok {
		t.Fatal("expected test harness to return true")
	}
}

func TestLRUCache(t *testing.T) {
	lru := goexamples.NewLRUCache[string, int](2)
	lru.Put("a", 1)
	lru.Put("b", 2)
	if val, ok := lru.Get("a"); !ok || val != 1 {
		t.Fatalf("expected get 'a' = 1, got %v", val)
	}
	lru.Put("c", 3) // evicts "b"
	if lru.Has("b") {
		t.Fatal("expected 'b' to be evicted")
	}
	if val, ok := lru.Get("b"); ok {
		t.Fatalf("expected 'b' to be absent, got %v", val)
	}
	if val, ok := lru.Get("c"); !ok || val != 3 {
		t.Fatalf("expected get 'c' = 3, got %v", val)
	}
	if val, ok := lru.Get("a"); !ok || val != 1 {
		t.Fatalf("expected get 'a' = 1, got %v", val)
	}
}

func TestLRUCacheHarness(t *testing.T) {
	ok := goexamples.TestLRUCache(2, []goexamples.LRUOp{
		{Op: "put", Key: "a", Val: 1},
		{Op: "put", Key: "b", Val: 2},
		{Op: "get", Key: "a", Val: 0},
		{Op: "remove", Key: "b", Val: 0},
	})
	if !ok {
		t.Fatal("expected test harness to return true")
	}
}

func TestExpressionParser(t *testing.T) {
	res1 := goexamples.EvaluateExpression("2 + 3 * 4")
	if res1 != 14.0 {
		t.Fatalf("expected 14.0, got %v", res1)
	}
	res2 := goexamples.EvaluateExpression("(2 + 3) * 4")
	if res2 != 20.0 {
		t.Fatalf("expected 20.0, got %v", res2)
	}

	valid := goexamples.EvaluateExpressionTransformer("2 + 3 * 4")
	if valid != "2 + 3 * 4" {
		t.Fatalf("expected '2 + 3 * 4', got %s", valid)
	}

	defer func() {
		r := recover()
		if r == nil {
			t.Fatal("expected panic for invalid syntax")
		}
		if _, ok := r.(*runtime.UnsatisfiedAssumptionError); !ok {
			t.Fatalf("expected *UnsatisfiedAssumptionError, got %T", r)
		}
	}()
	goexamples.EvaluateExpressionTransformer("invalid expression ++")
}

func TestIdentityMatrix(t *testing.T) {
	m := goexamples.Identity(3)
	if len(m) != 3 {
		t.Fatalf("expected len 3, got %d", len(m))
	}
}

func TestLevenshtein(t *testing.T) {
	if d := goexamples.Levenshtein("kitten", "sitting"); d != 3 {
		t.Fatalf("expected 3, got %d", d)
	}
	if d := goexamples.Levenshtein("hello", "hello"); d != 0 {
		t.Fatalf("expected 0, got %d", d)
	}
}
