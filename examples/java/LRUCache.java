import com.nanofuzz.runtime.Assert;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.DoubleSupplier;

/**
 * Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.
 *
 * When the number of stored entries reaches capacity, adding a new key
 * evicts the least recently accessed (retrieved or inserted) entry.
 */
public class LRUCache<K, V> {

  private final LinkedHashMap<K, V> cache;
  private final int cap;

  /**
   * Initializes a new LRU cache with the specified capacity limit.
   *
   * @param capacity The maximum number of entries the cache can hold
   * @throws AssertionError if capacity is not a positive integer
   */
  public LRUCache(int capacity) {
    Assert.that(capacity > 0, "Capacity must be a positive integer");
    this.cap = capacity;
    // accessOrder = true so get/put updates recency
    this.cache = new LinkedHashMap<K, V>(capacity, 0.75f, true) {
      @Override
      protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > cap;
      }
    };
  } // fn: LRUCache

  /**
   * Looks up a value by key and marks it as the most recently used entry.
   *
   * @param key The key to retrieve
   * @return The value associated with the key, or {@code null} if not present
   */
  public V get(K key) {
    return cache.get(key);
  } // fn: get

  /**
   * Inserts or updates a key-value pair.
   *
   * @param key   The key to insert or update
   * @param value The value to associate with the key
   */
  public void put(K key, V value) {
    cache.put(key, value);
  } // fn: put

  /**
   * Checks whether a key is present in the cache without updating its recency.
   *
   * @param key The key to check
   * @return {@code true} if the key exists, {@code false} otherwise
   */
  public boolean has(K key) {
    return cache.containsKey(key);
  } // fn: has

  /**
   * Removes a key and its associated value from the cache.
   *
   * @param key The key to remove
   * @return {@code true} if the key was present and removed, {@code false}
   *         otherwise
   */
  public boolean remove(K key) {
    return cache.remove(key) != null;
  } // fn: remove

  /**
   * Returns the current number of entries stored in the cache.
   *
   * @return Current size of the cache
   */
  public int size() {
    return cache.size();
  } // fn: size

  /**
   * Returns the maximum capacity of the cache.
   *
   * @return Cache capacity limit
   */
  public int capacity() {
    return cap;
  } // fn: capacity

  /**
   * Checks whether the cache is empty.
   *
   * @return {@code true} if empty, {@code false} otherwise
   */
  public boolean isEmpty() {
    return cache.isEmpty();
  } // fn: isEmpty

  /**
   * Removes all entries from the cache.
   */
  public void clear() {
    cache.clear();
  } // fn: clear

  /**
   * Returns all keys ordered from least recently used (first) to most recently
   * used (last).
   *
   * @return List of keys in LRU order
   */
  public List<K> keys() {
    return new ArrayList<>(cache.keySet());
  } // fn: keys

  /**
   * Test harness verifying that LRUCache maintains all invariants across
   * a sequence of operations.
   *
   * @param capacity   Maximum capacity of the cache
   * @param operations Sequence of operation records to execute
   * @return {@code true} if all operations and invariants succeed
   */
  public static boolean testLRUCache(int capacity, List<CacheOp> operations) {
    if (capacity <= 0 || capacity > 32) {
      return true;
    }
    LRUCache<String, Integer> lru = new LRUCache<>(capacity);
    LinkedHashMap<String, Integer> shadow = new LinkedHashMap<>(capacity, 0.75f, true);

    for (CacheOp opRecord : operations) {
      if (opRecord == null || opRecord.op() == null || opRecord.key() == null) {
        continue;
      }
      String op = opRecord.op().trim().toLowerCase();
      String key = opRecord.key();
      int val = opRecord.value();

      if ("put".equals(op) || op.startsWith("pu") || "+".equals(op)) {
        lru.put(key, val);
        if (shadow.containsKey(key)) {
          shadow.put(key, val);
        } else {
          if (shadow.size() >= capacity) {
            String oldest = shadow.keySet().iterator().next();
            shadow.remove(oldest);
          }
          shadow.put(key, val);
        }
      } else if ("get".equals(op) || op.startsWith("g") || "?".equals(op)) {
        Integer got = lru.get(key);
        Integer expected = shadow.get(key);
        Assert.that(Objects.equals(got, expected), "get mismatch for key " + key);
      } else if ("has".equals(op) || op.startsWith("h")) {
        boolean had = lru.has(key);
        boolean expected = shadow.containsKey(key);
        Assert.that(had == expected, "has mismatch for key " + key);
      } else if ("remove".equals(op) || op.startsWith("r") || "-".equals(op)) {
        boolean removed = lru.remove(key);
        boolean expected = shadow.remove(key) != null;
        Assert.that(removed == expected, "remove mismatch for key " + key);
      } else if ("clear".equals(op) || op.startsWith("cl")) {
        lru.clear();
        shadow.clear();
      }

      Assert.that(lru.size() == shadow.size(), "size mismatch");
      Assert.that(lru.isEmpty() == shadow.isEmpty(), "isEmpty mismatch");
      Assert.that(lru.keys().equals(new ArrayList<>(shadow.keySet())), "keys mismatch");
    }

    return true;
  } // fn: testLRUCache

  /**
   * User-provided input generator producing realistic LRU cache operation
   * sequences.
   *
   * @param prng Seeded pseudo-random number generator
   * @return Argument array containing capacity and operation list
   */
  public static Object[] testLRUCacheGenerator(DoubleSupplier prng) {
    int cap = (int) (prng.getAsDouble() * 4) + 1;
    int opCount = (int) (prng.getAsDouble() * 10) + 1;
    String[] opNames = { "put", "get", "has", "remove", "clear" };
    String[] keyNames = { "k1", "k2", "k3", "k4" };
    List<CacheOp> ops = new ArrayList<>(opCount);
    for (int i = 0; i < opCount; i++) {
      String op = opNames[(int) (prng.getAsDouble() * opNames.length)];
      String key = keyNames[(int) (prng.getAsDouble() * keyNames.length)];
      int val = (int) (prng.getAsDouble() * 100);
      ops.add(new CacheOp(op, key, val));
    }
    return new Object[] { cap, ops };
  } // fn: testLRUCacheGenerator

  /**
   * Cache operation record representing an operation name, key, and operand
   * value.
   */
  public record CacheOp(String op, String key, int value) {
  }
} // class: LRUCache
