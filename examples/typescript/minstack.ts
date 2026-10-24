import assert from "assert";

/**
 * Test harness verifying that MinStack maintains all invariants across
 * a sequence of operations.
 *
 * @param operations Sequence of [operation, value] pairs to execute
 * @returns `true` if all operations and invariants succeed
 */
export function testMinStack(operations: [MinStackOp, number][]): boolean {
  const ms = new MinStack<number>();
  const shadow: number[] = [];

  for (const [op, val] of operations) {
    if (op === "push") {
      ms.push(val);
      shadow.push(val);
    } else if (op === "pop") {
      const popped = ms.pop();
      const expected = shadow.pop();
      assert.strictEqual(
        popped,
        expected,
        `pop returned ${popped}, expected ${expected}`,
      );
    } else if (op === "top") {
      const topped = ms.top();
      const expected =
        shadow.length > 0 ? shadow[shadow.length - 1] : undefined;
      assert.strictEqual(
        topped,
        expected,
        `top returned ${topped}, expected ${expected}`,
      );
    } else if (op === "min") {
      const minVal = ms.getMin();
      const expected = shadow.length > 0 ? Math.min(...shadow) : undefined;
      assert.strictEqual(
        minVal,
        expected,
        `getMin returned ${minVal}, expected ${expected}`,
      );
    } else if (op === "clear") {
      ms.clear();
      shadow.length = 0;
    }

    assert.strictEqual(
      ms.size(),
      shadow.length,
      `size ${ms.size()} mismatch with shadow length ${shadow.length}`,
    );
    assert.strictEqual(
      ms.isEmpty(),
      shadow.length === 0,
      `isEmpty ${ms.isEmpty()} inconsistent with shadow length ${shadow.length}`,
    );
    const currentMin = ms.getMin();
    const expectedMin = shadow.length > 0 ? Math.min(...shadow) : undefined;
    assert.strictEqual(
      currentMin,
      expectedMin,
      `invariant getMin ${currentMin} !== expected ${expectedMin}`,
    );
  }

  return true;
} // fn: testMinStack

/**
 * User-provided input generator producing realistic MinStack operation sequences.
 */
export function testMinStackGenerator(
  prng: () => number,
): Parameters<typeof testMinStack> {
  const opCount = Math.floor(prng() * 10) + 1;
  const opNames: MinStackOp[] = ["push", "pop", "top", "min", "clear"];
  const ops: [MinStackOp, number][] = [];
  for (let i = 0; i < opCount; i++) {
    const op = opNames[Math.floor(prng() * opNames.length)];
    const val = Math.floor(prng() * 200) - 100;
    ops.push([op, val]);
  }
  return [ops];
} // fn: testMinStackGenerator

/**
 * LIFO Stack that supports push, pop, top, and retrieving the minimum element in O(1) time.
 *
 * Alongside the main stack elements, an auxiliary stack of prefix minimums is
 * maintained so that `getMin()` runs in constant time without scanning.
 */
export class MinStack<T = number> {
  private elements: T[] = [];
  private minElements: T[] = [];

  /**
   * Initializes an empty MinStack.
   */
  constructor() {} // fn: constructor

  /**
   * Pushes a value onto the stack and updates the running minimum.
   *
   * @param val The value to push onto the stack
   */
  public push(val: T): void {
    const currentMin =
      this.minElements.length === 0
        ? val
        : val < this.minElements[this.minElements.length - 1]
          ? val
          : this.minElements[this.minElements.length - 1];
    this.elements.push(val);
    this.minElements.push(currentMin);
  } // fn: push

  /**
   * Removes and returns the top element from the stack.
   *
   * @returns The removed element, or `undefined` if the stack is empty
   */
  public pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    this.minElements.pop();
    return this.elements.pop();
  } // fn: pop

  /**
   * Returns the top element without removing it.
   *
   * @returns The top element, or `undefined` if the stack is empty
   */
  public top(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.elements[this.elements.length - 1];
  } // fn: top

  /**
   * Retrieves the minimum element currently stored in the stack in O(1) time.
   *
   * @returns The minimum element, or `undefined` if the stack is empty
   */
  public getMin(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.minElements[this.minElements.length - 1];
  } // fn: getMin

  /**
   * Returns the number of elements currently stored on the stack.
   *
   * @returns The stack size
   */
  public size(): number {
    return this.elements.length;
  } // fn: size

  /**
   * Checks whether the stack contains no elements.
   *
   * @returns `true` if empty, `false` otherwise
   */
  public isEmpty(): boolean {
    return this.elements.length === 0;
  } // fn: isEmpty

  /**
   * Removes all elements from the stack.
   */
  public clear(): void {
    this.elements = [];
    this.minElements = [];
  } // fn: clear

  /**
   * Returns a copy of the elements currently on the stack from bottom to top.
   *
   * @returns Array of elements ordered from bottom to top
   */
  public toArray(): T[] {
    return [...this.elements];
  } // fn: toArray
}

export type MinStackOp = "push" | "pop" | "top" | "min" | "clear";
