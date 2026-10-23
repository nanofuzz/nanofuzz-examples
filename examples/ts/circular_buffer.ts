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
   * @throws Error if capacity is not an integer greater than zero
   */
  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("Capacity must be a positive integer");
    }
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
