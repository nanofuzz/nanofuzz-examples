import com.nanofuzz.runtime.Assert;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.DoubleSupplier;

/**
 * Fixed-capacity circular FIFO buffer (ring buffer).
 *
 * A circular buffer allocates a fixed-size contiguous array and uses two
 * pointers (`head` and `tail`) to read and write elements in first-in,
 * first-out (FIFO) order. When the end of the backing array is reached,
 * index arithmetic wraps around to the beginning modulo capacity.
 */
public class CircularBuffer<T> {

  private final Object[] buffer;
  private int head = 0;
  private int tail = 0;
  private int count = 0;
  private final int cap;

  /**
   * Initializes a new circular buffer with the specified maximum capacity.
   *
   * @param capacity The maximum number of elements the buffer can hold
   * @throws AssertionError if capacity is not greater than zero
   */
  public CircularBuffer(int capacity) {
    Assert.that(capacity > 0, "Capacity must be a positive integer");
    this.cap = capacity;
    this.buffer = new Object[capacity];
  } // fn: CircularBuffer

  /**
   * Appends an element to the tail of the circular buffer.
   *
   * @param item The element to push into the buffer
   * @return {@code true} if the item was added, or {@code false} if the buffer is
   *         full
   */
  public boolean push(T item) {
    if (isFull()) {
      return false;
    }
    buffer[tail] = item;
    tail = (tail + 1) % cap;
    count++;
    return true;
  } // fn: push

  /**
   * Removes and returns the oldest element at the head of the buffer.
   *
   * @return The oldest element, or {@code null} if the buffer is empty
   */
  @SuppressWarnings("unchecked")
  public T pop() {
    if (isEmpty()) {
      return null;
    }
    T item = (T) buffer[head];
    buffer[head] = null;
    head = (head + 1) % cap;
    count--;
    return item;
  } // fn: pop

  /**
   * Returns the oldest element at the head without removing it.
   *
   * @return The oldest element, or {@code null} if the buffer is empty
   */
  @SuppressWarnings("unchecked")
  public T peek() {
    if (isEmpty()) {
      return null;
    }
    return (T) buffer[head];
  } // fn: peek

  /**
   * Returns the current number of elements stored in the buffer.
   *
   * @return Current element count
   */
  public int size() {
    return count;
  } // fn: size

  /**
   * Returns the maximum capacity of the buffer.
   *
   * @return Maximum element capacity
   */
  public int capacity() {
    return cap;
  } // fn: capacity

  /**
   * Checks whether the buffer contains no elements.
   *
   * @return {@code true} if empty, {@code false} otherwise
   */
  public boolean isEmpty() {
    return count == 0;
  } // fn: isEmpty

  /**
   * Checks whether the buffer has reached maximum capacity.
   *
   * @return {@code true} if full, {@code false} otherwise
   */
  public boolean isFull() {
    return count == cap;
  } // fn: isFull

  /**
   * Resets the buffer to an empty state, clearing all stored elements.
   */
  public void clear() {
    for (int i = 0; i < cap; i++) {
      buffer[i] = null;
    }
    head = 0;
    tail = 0;
    count = 0;
  } // fn: clear

  /**
   * Returns a list containing the current elements in FIFO order (head to tail).
   *
   * @return List of elements ordered from head to tail
   */
  @SuppressWarnings("unchecked")
  public List<T> toList() {
    List<T> result = new ArrayList<>(count);
    for (int i = 0; i < count; i++) {
      int idx = (head + i) % cap;
      result.add((T) buffer[idx]);
    }
    return result;
  } // fn: toList

  /**
   * Test harness verifying that CircularBuffer maintains all invariants across
   * a sequence of operations.
   *
   * @param capacity   Maximum capacity of the buffer
   * @param operations Sequence of operation records to execute
   * @return {@code true} if all operations and invariants succeed
   */
  public static boolean testCircularBuffer(int capacity, List<BufferOp> operations) {
    if (capacity <= 0 || capacity > 64) {
      return true;
    }
    CircularBuffer<Integer> cb = new CircularBuffer<>(capacity);
    List<Integer> shadow = new ArrayList<>();

    for (BufferOp opRecord : operations) {
      if (opRecord == null || opRecord.op() == null) {
        continue;
      }
      String op = opRecord.op().trim().toLowerCase();
      int val = opRecord.value();

      if ("push".equals(op) || op.startsWith("pu") || "+".equals(op)) {
        boolean added = cb.push(val);
        if (shadow.size() < capacity) {
          Assert.that(added, "push failed when capacity was available");
          shadow.add(val);
        } else {
          Assert.that(!added, "push succeeded when buffer was full");
        }
      } else if ("pop".equals(op) || op.startsWith("po") || "-".equals(op)) {
        Integer popped = cb.pop();
        if (!shadow.isEmpty()) {
          Integer expected = shadow.remove(0);
          Assert.that(Objects.equals(popped, expected), "pop mismatch");
        } else {
          Assert.that(popped == null, "pop on empty buffer");
        }
      } else if ("peek".equals(op) || op.startsWith("pe") || "?".equals(op)) {
        Integer peeked = cb.peek();
        Integer expected = shadow.isEmpty() ? null : shadow.get(0);
        Assert.that(Objects.equals(peeked, expected), "peek mismatch");
      } else if ("clear".equals(op) || op.startsWith("cl")) {
        cb.clear();
        shadow.clear();
      }

      Assert.that(cb.size() == shadow.size(), "size mismatch");
      Assert.that(cb.isEmpty() == shadow.isEmpty(), "isEmpty mismatch");
      Assert.that(cb.isFull() == (shadow.size() == capacity), "isFull mismatch");
      Assert.that(cb.toList().equals(shadow), "toList mismatch");
    }

    return true;
  } // fn: testCircularBuffer

  /**
   * User-provided input generator producing realistic circular buffer operation
   * sequences.
   *
   * @param prng Seeded pseudo-random number generator
   * @return Argument array containing capacity and operation list
   */
  public static Object[] testCircularBufferGenerator(DoubleSupplier prng) {
    int cap = (int) (prng.getAsDouble() * 8) + 1;
    int opCount = (int) (prng.getAsDouble() * 10) + 1;
    String[] opNames = { "push", "pop", "peek", "clear" };
    List<BufferOp> ops = new ArrayList<>(opCount);
    for (int i = 0; i < opCount; i++) {
      String op = opNames[(int) (prng.getAsDouble() * opNames.length)];
      int val = (int) (prng.getAsDouble() * 100);
      ops.add(new BufferOp(op, val));
    }
    return new Object[] { cap, ops };
  } // fn: testCircularBufferGenerator

  /**
   * Buffer operation record representing an operation name and operand value.
   */
  public record BufferOp(String op, int value) {
  }
} // class: CircularBuffer
