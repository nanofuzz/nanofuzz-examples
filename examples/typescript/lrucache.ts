import assert from "assert";

/**
 * Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.
 *
 * When the number of stored entries reaches capacity, adding a new key
 * evicts the least recently accessed (retrieved or inserted) entry.
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly cap: number;

  /**
   * Initializes a new LRU cache with the specified capacity limit.
   *
   * @param capacity The maximum number of entries the cache can hold
   * @throws AssertionError if capacity is not a positive integer
   */
  constructor(capacity: number) {
    assert(
      Number.isInteger(capacity) && capacity > 0,
      "Capacity must be a positive integer",
    );
    this.cap = capacity;
    this.cache = new Map<K, V>();
  } // fn: constructor

  /**
   * Looks up a value by key and marks it as the most recently used entry.
   *
   * @param key The key to retrieve
   * @returns The value associated with the key, or `undefined` if not present
   */
  public get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  } // fn: get

  /**
   * Inserts or updates a key-value pair.
   *
   * If the key already exists, its value is updated and recency is refreshed.
   * If the key is new and the cache is at capacity, the oldest (least recently used)
   * key is evicted before inserting the new entry.
   *
   * @param key The key to insert or update
   * @param value The value to associate with the key
   */
  public put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.cap) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  } // fn: put

  /**
   * Checks whether a key is present in the cache without updating its recency.
   *
   * @param key The key to check
   * @returns `true` if the key exists, `false` otherwise
   */
  public has(key: K): boolean {
    return this.cache.has(key);
  } // fn: has

  /**
   * Removes a key and its associated value from the cache.
   *
   * @param key The key to remove
   * @returns `true` if the key was present and removed, `false` otherwise
   */
  public remove(key: K): boolean {
    return this.cache.delete(key);
  } // fn: remove

  /**
   * Returns the current number of entries stored in the cache.
   *
   * @returns Current size of the cache
   */
  public size(): number {
    return this.cache.size;
  } // fn: size

  /**
   * Returns the maximum capacity of the cache.
   *
   * @returns Cache capacity limit
   */
  public capacity(): number {
    return this.cap;
  } // fn: capacity

  /**
   * Checks whether the cache is empty.
   *
   * @returns `true` if empty, `false` otherwise
   */
  public isEmpty(): boolean {
    return this.cache.size === 0;
  } // fn: isEmpty

  /**
   * Removes all entries from the cache.
   */
  public clear(): void {
    this.cache.clear();
  } // fn: clear

  /**
   * Returns all keys ordered from least recently used (first) to most recently used (last).
   *
   * @returns Array of keys in LRU order
   */
  public keys(): K[] {
    return Array.from(this.cache.keys());
  } // fn: keys
}

/**
 * Test harness verifying that LRUCache maintains all invariants across
 * a sequence of operations.
 *
 * @param capacity Maximum capacity of the cache
 * @param operations Sequence of [operation, key, value] tuples to execute
 * @returns `true` if all operations and invariants succeed
 */
export function testLRUCache(
  capacity: number,
  operations: [LRUCacheOp, string, number][],
): boolean {
  if (capacity <= 0 || capacity > 32 || !Number.isInteger(capacity)) {
    return true;
  }
  const lru = new LRUCache<string, number>(capacity);
  const shadow = new Map<string, number>();

  for (const [op, key, val] of operations) {
    if (op === "put") {
      lru.put(key, val);
      if (shadow.has(key)) {
        shadow.delete(key);
      } else if (shadow.size >= capacity) {
        const oldest = shadow.keys().next().value;
        if (oldest !== undefined) {
          shadow.delete(oldest);
        }
      }
      shadow.set(key, val);
    } else if (op === "get") {
      const got = lru.get(key);
      const expected = shadow.get(key);
      assert.strictEqual(
        got,
        expected,
        `get(${key}) returned ${got}, expected ${expected}`,
      );
      if (expected !== undefined) {
        shadow.delete(key);
        shadow.set(key, expected);
      }
    } else if (op === "has") {
      const had = lru.has(key);
      const expected = shadow.has(key);
      assert.strictEqual(
        had,
        expected,
        `has(${key}) returned ${had}, expected ${expected}`,
      );
    } else if (op === "remove") {
      const removed = lru.remove(key);
      const expected = shadow.delete(key);
      assert.strictEqual(
        removed,
        expected,
        `remove(${key}) returned ${removed}, expected ${expected}`,
      );
    } else if (op === "clear") {
      lru.clear();
      shadow.clear();
    }

    assert.strictEqual(
      lru.size(),
      shadow.size,
      `size ${lru.size()} does not match shadow ${shadow.size}`,
    );
    assert.strictEqual(
      lru.isEmpty(),
      shadow.size === 0,
      `isEmpty inconsistent with shadow size`,
    );
    assert.deepStrictEqual(
      lru.keys(),
      Array.from(shadow.keys()),
      `keys mismatch`,
    );
  }

  return true;
} // fn: testLRUCache

/**
 * User-provided input generator producing realistic LRU cache operation sequences.
 */
export function testLRUCacheGenerator(
  prng: () => number,
): Parameters<typeof testLRUCache> {
  const cap = Math.floor(prng() * 4) + 1;
  const opCount = Math.floor(prng() * 10) + 1;
  const opNames: LRUCacheOp[] = ["put", "get", "has", "remove", "clear"];
  const keyNames = ["k1", "k2", "k3", "k4"];
  const ops: [LRUCacheOp, string, number][] = [];
  for (let i = 0; i < opCount; i++) {
    const op = opNames[Math.floor(prng() * opNames.length)];
    const key = keyNames[Math.floor(prng() * keyNames.length)];
    const val = Math.floor(prng() * 100);
    ops.push([op, key, val]);
  }
  return [cap, ops];
} // fn: testLRUCacheGenerator

export type LRUCacheOp = "put" | "get" | "has" | "remove" | "clear";
