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
