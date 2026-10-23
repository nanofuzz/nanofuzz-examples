/// Fixed-capacity circular FIFO buffer (ring buffer).
///
/// Allocates a contiguous vector and uses head and tail indices with modulo
/// arithmetic to achieve constant-time push, pop, and peek operations.
#[derive(Debug, Clone)]
pub struct CircularBuffer<T> {
    buffer: Vec<Option<T>>,
    head: usize,
    tail: usize,
    count: usize,
    cap: usize,
}

impl<T: Clone> CircularBuffer<T> {
    /// Creates a new circular buffer with the specified maximum capacity.
    ///
    /// # Panics
    /// Panics if `capacity == 0`.
    pub fn new(capacity: usize) -> Self {
        assert!(capacity > 0, "Capacity must be greater than zero");
        Self {
            buffer: vec![None; capacity],
            head: 0,
            tail: 0,
            count: 0,
            cap: capacity,
        }
    } // fn: new

    /// Appends an element to the tail of the buffer.
    ///
    /// Returns `true` if the item was added, or `false` if the buffer is full.
    pub fn push(&mut self, item: T) -> bool {
        if self.is_full() {
            return false;
        }
        self.buffer[self.tail] = Some(item);
        self.tail = (self.tail + 1) % self.cap;
        self.count += 1;
        true
    } // fn: push

    /// Removes and returns the oldest element at the head of the buffer.
    ///
    /// Returns `None` if the buffer is empty.
    pub fn pop(&mut self) -> Option<T> {
        if self.is_empty() {
            return None;
        }
        let item = self.buffer[self.head].take();
        self.head = (self.head + 1) % self.cap;
        self.count -= 1;
        item
    } // fn: pop

    /// Returns a reference to the oldest element at the head without removing it.
    ///
    /// Returns `None` if the buffer is empty.
    pub fn peek(&self) -> Option<&T> {
        if self.is_empty() {
            return None;
        }
        self.buffer[self.head].as_ref()
    } // fn: peek

    /// Returns the number of elements currently stored in the buffer.
    pub fn size(&self) -> usize {
        self.count
    } // fn: size

    /// Returns the maximum capacity of the buffer.
    pub fn capacity(&self) -> usize {
        self.cap
    } // fn: capacity

    /// Returns `true` if the buffer contains no elements.
    pub fn is_empty(&self) -> bool {
        self.count == 0
    } // fn: is_empty

    /// Returns `true` if the buffer has reached maximum capacity.
    pub fn is_full(&self) -> bool {
        self.count == self.cap
    } // fn: is_full

    /// Resets the buffer to an empty state, clearing all stored elements.
    pub fn clear(&mut self) {
        self.buffer = vec![None; self.cap];
        self.head = 0;
        self.tail = 0;
        self.count = 0;
    } // fn: clear

    /// Returns all elements in current FIFO order (head to tail).
    pub fn to_vec(&self) -> Vec<T> {
        let mut result = Vec::with_capacity(self.count);
        for i in 0..self.count {
            let idx = (self.head + i) % self.cap;
            if let Some(ref item) = self.buffer[idx] {
                result.push(item.clone());
            }
        }
        result
    } // fn: to_vec
}
