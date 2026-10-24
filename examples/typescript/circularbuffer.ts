import assert from "assert";

/**
 * Fixed-capacity circular FIFO buffer (ring buffer).
 *
 * A circular buffer allocates a fixed-size contiguous array and uses two
 * pointers (`head` and `tail`) to read and write elements in first-in,
 * first-out (FIFO) order. When the end of the backing array is reached,
 * index arithmetic wraps around to the beginning modulo capacity.
 */
export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private readonly cap: number;

  /**
   * Initializes a new circular buffer with the specified maximum capacity.
   *
   * @param capacity The maximum number of elements the buffer can hold
   * @throws AssertionError if capacity is not an integer greater than zero
   */
  constructor(capacity: number) {
    assert(
      Number.isInteger(capacity) && capacity > 0,
      "Capacity must be a positive integer",
    );
    this.cap = capacity;
    this.buffer = new Array(capacity);
  } // fn: constructor

  /**
   * Appends an element to the tail of the circular buffer.
   *
   * @param item The element to push into the buffer
   * @returns `true` if the item was added, or `false` if the buffer is full
   */
  public push(item: T): boolean {
    if (this.isFull()) {
      return false;
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.cap;
    this.count++;
    return true;
  } // fn: push

  /**
   * Removes and returns the oldest element at the head of the buffer.
   *
   * @returns The oldest element, or `undefined` if the buffer is empty
   */
  public pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.cap;
    this.count--;
    return item;
  } // fn: pop

  /**
   * Returns the oldest element at the head without removing it.
   *
   * @returns The oldest element, or `undefined` if the buffer is empty
   */
  public peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.buffer[this.head];
  } // fn: peek

  /**
   * Returns the current number of elements stored in the buffer.
   *
   * @returns Current element count
   */
  public size(): number {
    return this.count;
  } // fn: size

  /**
   * Returns the maximum capacity of the buffer.
   *
   * @returns Maximum element capacity
   */
  public capacity(): number {
    return this.cap;
  } // fn: capacity

  /**
   * Checks whether the buffer contains no elements.
   *
   * @returns `true` if empty, `false` otherwise
   */
  public isEmpty(): boolean {
    return this.count === 0;
  } // fn: isEmpty

  /**
   * Checks whether the buffer has reached maximum capacity.
   *
   * @returns `true` if full, `false` otherwise
   */
  public isFull(): boolean {
    return this.count === this.cap;
  } // fn: isFull

  /**
   * Resets the buffer to an empty state, clearing all stored elements.
   */
  public clear(): void {
    this.buffer = new Array(this.cap);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  } // fn: clear

  /**
   * Returns an array containing the current elements in FIFO order
   * (from oldest at the head to newest at the tail).
   *
   * @returns Array of elements ordered from head to tail
   */
  public toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.cap;
      result.push(this.buffer[idx] as T);
    }
    return result;
  } // fn: toArray
}

/**
 * Test harness verifying that CircularBuffer maintains all invariants across
 * a sequence of operations.
 *
 * @param capacity Maximum capacity of the buffer
 * @param operations Sequence of [operation, value] pairs to execute
 * @returns `true` if all operations and invariants succeed
 */
export function testCircularBuffer(
  capacity: number,
  operations: [CircularBufferOp, number][],
): boolean {
  if (capacity <= 0 || capacity > 64 || !Number.isInteger(capacity)) {
    return true;
  }
  const cb = new CircularBuffer<number>(capacity);
  const shadow: number[] = [];

  for (const [op, val] of operations) {
    if (op === "push") {
      const added = cb.push(val);
      if (shadow.length < capacity) {
        assert(added, "push failed when capacity was available");
        shadow.push(val);
      } else {
        assert(!added, "push succeeded when buffer was full");
      }
    } else if (op === "pop") {
      const popped = cb.pop();
      if (shadow.length > 0) {
        const expected = shadow.shift();
        assert.strictEqual(
          popped,
          expected,
          `pop returned ${popped}, expected ${expected}`,
        );
      } else {
        assert.strictEqual(
          popped,
          undefined,
          `pop returned ${popped} on empty buffer`,
        );
      }
    } else if (op === "peek") {
      const peeked = cb.peek();
      const expected = shadow.length > 0 ? shadow[0] : undefined;
      assert.strictEqual(
        peeked,
        expected,
        `peek returned ${peeked}, expected ${expected}`,
      );
    } else if (op === "clear") {
      cb.clear();
      shadow.length = 0;
    }

    assert.strictEqual(cb.size(), shadow.length, "size mismatch");
    assert.strictEqual(
      cb.isEmpty(),
      shadow.length === 0,
      "isEmpty inconsistent with size",
    );
    assert.strictEqual(
      cb.isFull(),
      shadow.length === capacity,
      "isFull inconsistent with capacity",
    );
    assert.deepStrictEqual(cb.toArray(), shadow, "toArray mismatch");
  }

  return true;
} // fn: testCircularBuffer

/**
 * User-provided input generator producing realistic circular buffer operation sequences.
 */
export function testCircularBufferGenerator(
  prng: () => number,
): Parameters<typeof testCircularBuffer> {
  const cap = Math.floor(prng() * 8) + 1;
  const opCount = Math.floor(prng() * 10) + 1;
  const opNames: CircularBufferOp[] = ["push", "pop", "peek", "clear"];
  const ops: [CircularBufferOp, number][] = [];
  for (let i = 0; i < opCount; i++) {
    const op = opNames[Math.floor(prng() * opNames.length)];
    const val = Math.floor(prng() * 100);
    ops.push([op, val]);
  }
  return [cap, ops];
} // fn: testCircularBufferGenerator

export type CircularBufferOp = "push" | "pop" | "peek" | "clear";
