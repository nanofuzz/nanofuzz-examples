use std::collections::HashMap;
use std::hash::Hash;

/// Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.
///
/// When the cache is full, inserting a new key evicts the least recently
/// accessed entry. Retrieving or updating a key updates its recency.
#[derive(Debug, Clone)]
pub struct LRUCache<K, V> {
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
