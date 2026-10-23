use expression_parser::{CircularBuffer, LRUCache, MinStack};

#[test]
fn test_circular_buffer() {
    let mut cb = CircularBuffer::<i32>::new(3);
    assert!(cb.is_empty());
    assert!(cb.push(10));
    assert!(cb.push(20));
    assert!(cb.push(30));
    assert!(!cb.push(40)); // full
    assert!(cb.is_full());
    assert_eq!(cb.size(), 3);
    assert_eq!(cb.peek(), Some(&10));
    assert_eq!(cb.pop(), Some(10));
    assert!(cb.push(40)); // wrap-around push
    assert_eq!(cb.to_vec(), vec![20, 30, 40]);
    assert_eq!(cb.pop(), Some(20));
    assert_eq!(cb.pop(), Some(30));
    assert_eq!(cb.pop(), Some(40));
    assert_eq!(cb.pop(), None);
    assert!(cb.is_empty());
} // fn: test_circular_buffer

#[test]
fn test_min_stack() {
    let mut ms = MinStack::<i32>::new();
    assert!(ms.is_empty());
    assert_eq!(ms.get_min(), None);
    assert_eq!(ms.pop(), None);

    ms.push(5);
    assert_eq!(ms.get_min(), Some(&5));
    ms.push(3);
    assert_eq!(ms.get_min(), Some(&3));
    ms.push(7);
    assert_eq!(ms.get_min(), Some(&3));
    ms.push(3);
    assert_eq!(ms.get_min(), Some(&3));

    assert_eq!(ms.top(), Some(&3));
    assert_eq!(ms.pop(), Some(3));
    assert_eq!(ms.get_min(), Some(&3)); // duplicate min preserved
    assert_eq!(ms.pop(), Some(7));
    assert_eq!(ms.get_min(), Some(&3));
    assert_eq!(ms.pop(), Some(3));
    assert_eq!(ms.get_min(), Some(&5));
    assert_eq!(ms.size(), 1);
    assert_eq!(ms.pop(), Some(5));
    assert!(ms.is_empty());
} // fn: test_min_stack

#[test]
fn test_lru_cache() {
    let mut lru = LRUCache::<String, i32>::new(2);
    lru.put("a".to_string(), 1);
    lru.put("b".to_string(), 2);
    assert_eq!(lru.get(&"a".to_string()), Some(&1)); // "a" is now MRU, "b" is LRU
    lru.put("c".to_string(), 3); // evicts "b"
    assert!(!lru.has(&"b".to_string()));
    assert_eq!(lru.get(&"b".to_string()), None);
    assert_eq!(lru.get(&"c".to_string()), Some(&3));
    assert_eq!(lru.get(&"a".to_string()), Some(&1));
    assert_eq!(lru.keys(), vec!["c".to_string(), "a".to_string()]);
    assert!(lru.remove(&"c".to_string()));
    assert_eq!(lru.size(), 1);
} // fn: test_lru_cache
