import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

public class ExamplesTest {

  @Test
  void testExpressionParser() {
    assertEquals(14.0, ExpressionParser.evaluateExpression("2 + 3 * 4"), 1e-9);
    assertEquals(20.0, ExpressionParser.evaluateExpression("(2 + 3) * 4"), 1e-9);

    Object[] valid = ExpressionParser.evaluateExpressionTransformer("2 + 3 * 4");
    assertNotNull(valid);
    assertEquals("2 + 3 * 4", valid[0]);

    assertThrows(Exception.class, () -> {
      ExpressionParser.evaluateExpressionTransformer("invalid + ");
    });
  }

  @Test
  void testCircularBuffer() {
    CircularBuffer<Integer> cb = new CircularBuffer<>(3);
    assertTrue(cb.isEmpty());
    assertTrue(cb.push(10));
    assertTrue(cb.push(20));
    assertTrue(cb.push(30));
    assertFalse(cb.push(40)); // full
    assertTrue(cb.isFull());
    assertEquals(3, cb.size());
    assertEquals(10, cb.peek());
    assertEquals(10, cb.pop());
    assertTrue(cb.push(40)); // wrap around
    assertEquals(List.of(20, 30, 40), cb.toList());
    assertEquals(20, cb.pop());
    assertEquals(30, cb.pop());
    assertEquals(40, cb.pop());
    assertNull(cb.pop());
    assertTrue(cb.isEmpty());

    assertTrue(CircularBuffer.testCircularBuffer(3, List.of(
        new CircularBuffer.BufferOp("push", 1),
        new CircularBuffer.BufferOp("push", 2),
        new CircularBuffer.BufferOp("pop", 0),
        new CircularBuffer.BufferOp("clear", 0))));
  }

  @Test
  void testMinStack() {
    MinStack<Integer> ms = new MinStack<>();
    assertTrue(ms.isEmpty());
    assertNull(ms.getMin());
    assertNull(ms.pop());

    ms.push(5);
    assertEquals(5, ms.getMin());
    ms.push(3);
    assertEquals(3, ms.getMin());
    ms.push(7);
    assertEquals(3, ms.getMin());
    ms.push(3);
    assertEquals(3, ms.getMin());

    assertEquals(3, ms.top());
    assertEquals(3, ms.pop());
    assertEquals(3, ms.getMin());
    assertEquals(7, ms.pop());
    assertEquals(3, ms.getMin());
    assertEquals(3, ms.pop());
    assertEquals(5, ms.getMin());
    assertEquals(1, ms.size());
    assertEquals(5, ms.pop());
    assertTrue(ms.isEmpty());

    assertTrue(MinStack.testMinStack(List.of(
        new MinStack.StackOp("push", 10),
        new MinStack.StackOp("push", 5),
        new MinStack.StackOp("min", 0),
        new MinStack.StackOp("pop", 0))));
  }

  @Test
  void testLRUCache() {
    LRUCache<String, Integer> lru = new LRUCache<>(2);
    lru.put("a", 1);
    lru.put("b", 2);
    assertEquals(1, lru.get("a"));
    lru.put("c", 3); // evicts b
    assertFalse(lru.has("b"));
    assertNull(lru.get("b"));
    assertEquals(3, lru.get("c"));
    assertEquals(1, lru.get("a"));
    assertEquals(List.of("c", "a"), lru.keys());
    assertTrue(lru.remove("c"));
    assertEquals(1, lru.size());

    assertTrue(LRUCache.testLRUCache(2, List.of(
        new LRUCache.CacheOp("put", "k1", 10),
        new LRUCache.CacheOp("put", "k2", 20),
        new LRUCache.CacheOp("get", "k1", 0),
        new LRUCache.CacheOp("remove", "k2", 0))));
  }

  @Test
  void testLevenshtein() {
    assertEquals(3, Levenshtein.levenshtein("kitten", "sitting"));
    assertEquals(0, Levenshtein.levenshtein("hello", "hello"));
  }

  @Test
  void testIdentityMatrix() {
    int[][] m = IdentityMatrix.identity(3);
    assertNotNull(m);
    assertEquals(3, m.length);
  }
}
