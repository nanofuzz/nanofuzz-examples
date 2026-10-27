use std::collections::HashMap;
use std::hash::Hash;

/// Test harness verifying that LRUCache maintains all invariants across operations.
pub fn test_lru_cache(capacity: usize, operations: Vec<(String, String, i32)>) -> bool {
    if capacity == 0 || capacity > 32 {
        return true;
    }
    let mut lru = LRUCache::<String, i32>::new(capacity);
    let mut shadow: Vec<(String, i32)> = Vec::new();

    for (raw_op, key, val) in operations {
        let op = raw_op.trim().to_lowercase();
        if op == "put" || op.starts_with("pu") || op == "+" {
            lru.put(key.clone(), val);
            if let Some(pos) = shadow.iter().position(|(k, _)| k == &key) {
                shadow.remove(pos);
            } else if shadow.len() >= capacity {
                shadow.remove(0);
            }
            shadow.push((key.clone(), val));
        } else if op == "get" || op.starts_with("g") || op == "?" {
            let got = lru.get(&key).copied();
            let expected = shadow.iter().find(|(k, _)| k == &key).map(|(_, v)| *v);
            assert_eq!(got, expected, "get mismatch for key {}", key);
            if let Some(pos) = shadow.iter().position(|(k, _)| k == &key) {
                let entry = shadow.remove(pos);
                shadow.push(entry);
            }
        } else if op == "has" || op.starts_with("h") {
            let had = lru.has(&key);
            let expected = shadow.iter().any(|(k, _)| k == &key);
            assert_eq!(had, expected, "has mismatch for key {}", key);
        } else if op == "remove" || op.starts_with("r") || op == "-" {
            let removed = lru.remove(&key);
            let expected = if let Some(pos) = shadow.iter().position(|(k, _)| k == &key) {
                shadow.remove(pos);
                true
            } else {
                false
            };
            assert_eq!(removed, expected, "remove mismatch for key {}", key);
        } else if op == "clear" || op.starts_with("cl") {
            lru.clear();
            shadow.clear();
        }

        assert_eq!(lru.size(), shadow.len(), "size mismatch");
        assert_eq!(lru.is_empty(), shadow.is_empty(), "is_empty mismatch");
        let keys = lru.keys();
        let shadow_keys: Vec<String> = shadow.iter().map(|(k, _)| k.clone()).collect();
        assert_eq!(keys, shadow_keys, "keys mismatch");
    }

    true
} // fn: test_lru_cache

/// User-provided input generator producing realistic LRU cache operation sequences.
pub fn test_lru_cache_generator(
    mut prng: impl FnMut() -> f64,
) -> Option<(usize, Vec<(String, String, i32)>)> {
    let cap = (prng() * 4.0) as usize + 1;
    let op_count = (prng() * 10.0) as usize + 1;
    let op_names = ["put", "get", "has", "remove", "clear"];
    let key_names = ["k1", "k2", "k3", "k4"];
    let mut ops = Vec::with_capacity(op_count);
    for _ in 0..op_count {
        let op_idx = (prng() * op_names.len() as f64) as usize;
        let op = op_names[op_idx].to_string();
        let key_idx = (prng() * key_names.len() as f64) as usize;
        let key = key_names[key_idx].to_string();
        let val = (prng() * 100.0) as i32;
        ops.push((op, key, val));
    }
    Some((cap, ops))
} // fn: test_lru_cache_generator

/// Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.
///
/// When the cache is full, inserting a new key evicts the least recently
/// accessed entry. Retrieving or updating a key updates its recency.
#[derive(Debug, Clone)]
pub struct LRUCache<K: Hash + Eq, V> {
    cache: HashMap<K, V>,
    order: Vec<K>,
    cap: usize,
}

impl<K: Hash + Eq + Clone, V: Clone> LRUCache<K, V> {
    /// Creates a new LRU cache with the specified capacity limit.
    ///
    /// # Panics
    /// Panics if `capacity == 0`.
    pub fn new(capacity: usize) -> Self {
        assert!(capacity > 0, "Capacity must be greater than zero");
        Self {
            cache: HashMap::with_capacity(capacity),
            order: Vec::with_capacity(capacity),
            cap: capacity,
        }
    } // fn: new

    /// Looks up a value by key and marks it as the most recently accessed entry.
    ///
    /// Returns `None` if the key is not in the cache.
    pub fn get(&mut self, key: &K) -> Option<&V> {
        if !self.cache.contains_key(key) {
            return None;
        }
        if let Some(pos) = self.order.iter().position(|k| k == key) {
            let k = self.order.remove(pos);
            self.order.push(k);
        }
        self.cache.get(key)
    } // fn: get

    /// Inserts or updates a key-value pair.
    ///
    /// If the key exists, its value is updated and marked most recently used.
    /// If inserting a new key exceeds capacity, the oldest entry is evicted.
    pub fn put(&mut self, key: K, value: V) {
        if self.cache.contains_key(&key) {
            if let Some(pos) = self.order.iter().position(|k| k == &key) {
                self.order.remove(pos);
            }
        } else if self.order.len() >= self.cap {
            let oldest_key = self.order.remove(0);
            self.cache.remove(&oldest_key);
        }
        self.order.push(key.clone());
        self.cache.insert(key, value);
    } // fn: put

    /// Checks whether a key is present in the cache without updating its recency.
    pub fn has(&self, key: &K) -> bool {
        self.cache.contains_key(key)
    } // fn: has

    /// Removes a key and its value from the cache.
    ///
    /// Returns `true` if the key was found and removed, `false` otherwise.
    pub fn remove(&mut self, key: &K) -> bool {
        if let Some(pos) = self.order.iter().position(|k| k == key) {
            self.order.remove(pos);
            self.cache.remove(key);
            true
        } else {
            false
        }
    } // fn: remove

    /// Returns the number of entries currently stored in the cache.
    pub fn size(&self) -> usize {
        self.order.len()
    } // fn: size

    /// Returns the maximum capacity of the cache.
    pub fn capacity(&self) -> usize {
        self.cap
    } // fn: capacity

    /// Returns `true` if the cache contains no entries.
    pub fn is_empty(&self) -> bool {
        self.order.is_empty()
    } // fn: is_empty

    /// Removes all entries from the cache.
    pub fn clear(&mut self) {
        self.cache.clear();
        self.order.clear();
    } // fn: clear

    /// Returns all keys ordered from least recently used to most recently used.
    pub fn keys(&self) -> Vec<K> {
        self.order.clone()
    } // fn: keys
}
