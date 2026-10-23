/// LIFO Stack that supports push, pop, top, and retrieving the minimum element in O(1) time.
///
/// A parallel stack of running minimums is kept in sync with the elements stack,
/// allowing constant-time retrieval of the minimum value.
#[derive(Debug, Clone, Default)]
pub struct MinStack<T> {
    elements: Vec<T>,
    min_elements: Vec<T>,
}

impl<T: PartialOrd + Clone> MinStack<T> {
    /// Creates a new, empty `MinStack`.
    pub fn new() -> Self {
        Self {
            elements: Vec::new(),
            min_elements: Vec::new(),
        }
    } // fn: new

    /// Pushes a value onto the stack and updates the running minimum.
    pub fn push(&mut self, val: T) {
        let current_min = match self.min_elements.last() {
            Some(min) => {
                if &val < min {
                    val.clone()
                } else {
                    min.clone()
                }
            }
            None => val.clone(),
        };
        self.elements.push(val);
        self.min_elements.push(current_min);
    } // fn: push

    /// Removes and returns the top element from the stack.
    ///
    /// Returns `None` if the stack is empty.
    pub fn pop(&mut self) -> Option<T> {
        if self.is_empty() {
            return None;
        }
        self.min_elements.pop();
        self.elements.pop()
    } // fn: pop

    /// Returns a reference to the top element without removing it.
    ///
    /// Returns `None` if the stack is empty.
    pub fn top(&self) -> Option<&T> {
        self.elements.last()
    } // fn: top

    /// Returns a reference to the minimum element currently on the stack in O(1) time.
    ///
    /// Returns `None` if the stack is empty.
    pub fn get_min(&self) -> Option<&T> {
        self.min_elements.last()
    } // fn: get_min

    /// Returns the number of elements on the stack.
    pub fn size(&self) -> usize {
        self.elements.len()
    } // fn: size

    /// Returns `true` if the stack contains no elements.
    pub fn is_empty(&self) -> bool {
        self.elements.is_empty()
    } // fn: is_empty

    /// Removes all elements from the stack.
    pub fn clear(&mut self) {
        self.elements.clear();
        self.min_elements.clear();
    } // fn: clear

    /// Returns a copy of the elements from bottom to top.
    pub fn to_vec(&self) -> Vec<T> {
        self.elements.clone()
    } // fn: to_vec
}
