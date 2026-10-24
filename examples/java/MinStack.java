import com.nanofuzz.runtime.Assert;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.function.DoubleSupplier;

/**
 * LIFO Stack that supports push, pop, top, and retrieving the minimum element
 * in O(1) time.
 *
 * Alongside the main stack elements, an auxiliary stack of prefix minimums is
 * maintained so that {@code getMin()} runs in constant time without scanning.
 */
public class MinStack<T extends Comparable<T>> {

  private final List<T> elements = new ArrayList<>();
  private final List<T> minElements = new ArrayList<>();

  /**
   * Initializes an empty MinStack.
   */
  public MinStack() {
  } // fn: MinStack

  /**
   * Pushes a value onto the stack and updates the running minimum.
   *
   * @param val The value to push onto the stack
   */
  public void push(T val) {
    T currentMin = minElements.isEmpty()
        ? val
        : (val.compareTo(minElements.get(minElements.size() - 1)) < 0
            ? val
            : minElements.get(minElements.size() - 1));
    elements.add(val);
    minElements.add(currentMin);
  } // fn: push

  /**
   * Removes and returns the top element from the stack.
   *
   * @return The removed element, or {@code null} if the stack is empty
   */
  public T pop() {
    if (isEmpty()) {
      return null;
    }
    minElements.remove(minElements.size() - 1);
    return elements.remove(elements.size() - 1);
  } // fn: pop

  /**
   * Returns the top element without removing it.
   *
   * @return The top element, or {@code null} if the stack is empty
   */
  public T top() {
    if (isEmpty()) {
      return null;
    }
    return elements.get(elements.size() - 1);
  } // fn: top

  /**
   * Retrieves the minimum element currently stored in the stack in O(1) time.
   *
   * @return The minimum element, or {@code null} if the stack is empty
   */
  public T getMin() {
    if (isEmpty()) {
      return null;
    }
    return minElements.get(minElements.size() - 1);
  } // fn: getMin

  /**
   * Returns the number of elements currently stored on the stack.
   *
   * @return The stack size
   */
  public int size() {
    return elements.size();
  } // fn: size

  /**
   * Checks whether the stack contains no elements.
   *
   * @return {@code true} if empty, {@code false} otherwise
   */
  public boolean isEmpty() {
    return elements.isEmpty();
  } // fn: isEmpty

  /**
   * Removes all elements from the stack.
   */
  public void clear() {
    elements.clear();
    minElements.clear();
  } // fn: clear

  /**
   * Returns a copy of the elements currently on the stack from bottom to top.
   *
   * @return List of elements ordered from bottom to top
   */
  public List<T> toList() {
    return new ArrayList<>(elements);
  } // fn: toList

  /**
   * Test harness verifying that MinStack maintains all invariants across
   * a sequence of operations.
   *
   * @param operations Sequence of operation records to execute
   * @return {@code true} if all operations and invariants succeed
   */
  public static boolean testMinStack(List<StackOp> operations) {
    MinStack<Integer> ms = new MinStack<>();
    List<Integer> shadow = new ArrayList<>();

    for (StackOp opRecord : operations) {
      if (opRecord == null || opRecord.op() == null) {
        continue;
      }
      String op = opRecord.op().trim().toLowerCase();
      int val = opRecord.value();

      if ("push".equals(op) || op.startsWith("pu") || "+".equals(op)) {
        ms.push(val);
        shadow.add(val);
      } else if ("pop".equals(op) || op.startsWith("po") || "-".equals(op)) {
        Integer popped = ms.pop();
        Integer expected = shadow.isEmpty() ? null : shadow.remove(shadow.size() - 1);
        Assert.that(Objects.equals(popped, expected), "pop mismatch");
      } else if ("top".equals(op) || op.startsWith("t") || "?".equals(op)) {
        Integer topped = ms.top();
        Integer expected = shadow.isEmpty() ? null : shadow.get(shadow.size() - 1);
        Assert.that(Objects.equals(topped, expected), "top mismatch");
      } else if ("min".equals(op) || op.startsWith("m") || op.contains("min")) {
        Integer minVal = ms.getMin();
        Integer expected = shadow.isEmpty() ? null : Collections.min(shadow);
        Assert.that(Objects.equals(minVal, expected), "getMin mismatch");
      } else if ("clear".equals(op) || op.startsWith("cl")) {
        ms.clear();
        shadow.clear();
      }

      Assert.that(ms.size() == shadow.size(), "size mismatch");
      Assert.that(ms.isEmpty() == shadow.isEmpty(), "isEmpty mismatch");
      Integer currentMin = ms.getMin();
      Integer expectedMin = shadow.isEmpty() ? null : Collections.min(shadow);
      Assert.that(Objects.equals(currentMin, expectedMin), "invariant getMin mismatch");
    }

    return true;
  } // fn: testMinStack

  /**
   * User-provided input generator producing realistic MinStack operation
   * sequences.
   *
   * @param prng Seeded pseudo-random number generator
   * @return Argument array containing operation list
   */
  public static Object[] testMinStackGenerator(DoubleSupplier prng) {
    int opCount = (int) (prng.getAsDouble() * 10) + 1;
    String[] opNames = { "push", "pop", "top", "min", "clear" };
    List<StackOp> ops = new ArrayList<>(opCount);
    for (int i = 0; i < opCount; i++) {
      String op = opNames[(int) (prng.getAsDouble() * opNames.length)];
      int val = (int) (prng.getAsDouble() * 200) - 100;
      ops.add(new StackOp(op, val));
    }
    return new Object[] { ops };
  } // fn: testMinStackGenerator

  /**
   * Stack operation record representing an operation name and operand value.
   */
  public record StackOp(String op, int value) {
  }
} // class: MinStack
