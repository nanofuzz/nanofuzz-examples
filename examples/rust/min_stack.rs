/// Test harness verifying that MinStack maintains all invariants across operations.
pub fn test_min_stack(operations: Vec<(String, i32)>) -> bool {
    let mut ms = MinStack::<i32>::new();
    let mut shadow: Vec<i32> = Vec::new();

    for (raw_op, val) in operations {
        let op = raw_op.trim().to_lowercase();
        if op == "push" || op.starts_with("pu") || op == "+" {
            ms.push(val);
            shadow.push(val);
        } else if op == "pop" || op.starts_with("po") || op == "-" {
            let popped = ms.pop();
            let expected = shadow.pop();
            assert_eq!(popped, expected, "pop mismatch");
        } else if op == "top" || op.starts_with("t") || op == "?" {
            let topped = ms.top().copied();
            let expected = shadow.last().copied();
            assert_eq!(topped, expected, "top mismatch");
        } else if op == "min" || op.starts_with("m") || op.contains("min") {
            let min_val = ms.get_min().copied();
            let expected = shadow.iter().min().copied();
            assert_eq!(min_val, expected, "get_min mismatch");
        } else if op == "clear" || op.starts_with("cl") {
            ms.clear();
            shadow.clear();
        }

        assert_eq!(ms.size(), shadow.len(), "size mismatch");
        assert_eq!(ms.is_empty(), shadow.is_empty(), "is_empty mismatch");
        let current_min = ms.get_min().copied();
        let expected_min = shadow.iter().min().copied();
        assert_eq!(current_min, expected_min, "invariant get_min mismatch");
    }

    true
} // fn: test_min_stack

/// User-provided input generator producing realistic MinStack operation sequences.
pub fn test_min_stack_generator(mut prng: impl FnMut() -> f64) -> Option<(Vec<(String, i32)>,)> {
    let op_count = (prng() * 10.0) as usize + 1;
    let op_names = ["push", "pop", "top", "min", "clear"];
    let mut ops = Vec::with_capacity(op_count);
    for _ in 0..op_count {
        let op_idx = (prng() * op_names.len() as f64) as usize;
        let op = op_names[op_idx].to_string();
        let val = (prng() * 200.0) as i32 - 100;
        ops.push((op, val));
    }
    Some((ops,))
} // fn: test_min_stack_generator

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
