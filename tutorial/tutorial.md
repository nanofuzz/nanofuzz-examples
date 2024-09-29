# Tutorial: NaNofuzz

NaNofuzz is a useful tool for quickly testing TypeScript programs.

## How NaNofuzz works

NaNofuzz randomly generates inputs for the function under test and organizes the test results on the screen. NaNofuzz uses 3 validators---heuristic, human, and property---to categorize outputs as correct or incorrect.

## How to use NaNofuzz

We will walk through each step in the tutorial, but here is a quick overview.

1. Click the `NaNofuzz` button above your function
2. Adjust input ranges and validators, if needed
3. Click `Test`

Now let's see the tool work.

## Exercise 1

1. Open the `tutorial.ts` file in this tutorials folder.
2. Click the `NaNofuzz` button above the function `findMedianSortedArrays`. This opens NaNofuzz in a window to the right.

### Heuristic Validator (bug icon)

The `heuristic validator` provides a quick way to find outputs that contain: `null`, `undefined`, `NaN`, `Infinity`, timeouts, or runtime exceptions

3. Notice the  `Use heuristic validator` checkbox is selected by default
4. Click `Test`
5. Test results are categorized by the `heuristic validator` into the `Failed` or `Passed` tabs.
6. Did any tests fail? Did any pass?
7. Notice in the results grid that the `heuristic validator` (the bug icon) marked `[],[]` as failed because its output is `NaN`! 

### Human validator (person icon)

The `human validator` (the person icon) lets you mark specific tests as passed (✓) or failed (✗). This is useful for saving interesting results and specific examples.

8. Find `[],[]` and click the (✗) button in the human validator column. 
9. Type in the expected output: `undefined` and click 'ok'.
10. Find a different test case that looks correct. Click the check mark (✓) in the human validator column.

You can also use the `pin button` to save a test you find interesting. Both Pinned and human-validated tests will run again during re-testing.

11.  Find a different test case and click the pin button.

## Exercise 2

### Property validator (robot icon)

Now that we've seen some results, let's use a `property validator`, which is a function you write that automatically passes or fails outputs. 

1. Scroll down to the bottom of `tutorial.ts` amd find the property validator named `findMedianSortedArraysValidator`. Let's take a closer look:

   - `r.in[0]` and `r.in[1]` are the test inputs that correspond to parameters `nums1` and `nums2` of `findMedianSortedArrays()`.
   - `r.out` contains the test output
   - Returning `true` indicates the validator is **passing** the test. Returning `false` means the validator is **failing** the test.
   - This property validator checks that the output value is between the minimum and maximum.

Let's test using the existing property validator we just looked at.

2. Check `Property validator(s)` (leave `Use heuristic validator` checked).
3. Hover over the text `Property validator(s)` to see the list of validators for this function. Right now, the only one is `findMedianSortedArraysValidator`.
4. Click `Test`.
5. The test results are categorized using the `heuristic validator` (bug icon), the `human validator` (person icon), **AND** the `property validator` (robot icon). 

Did any tests fail? Which validators categorized these tests as failed or passed?

> **Note**: When present, the human and property validators take precedence over the heuristic validator.

> **Note**: If the human and property validators ever disagree, NaNofuzz displays a special `Disagree` tab with examples of the disagreement to help you find and fix whichever validator is incorrect.

## Exercise 3

The property validator didn't find anything new. What are some other properties that we could test?

- `median(nums1,nums2) == median(nums2,nums1)`
- `median()` equals the result of a different implementation
- If the total length of the arrays is odd, the output should appear in the array
- etc.

Let's count the number of values smaller than or larger than the median.

1. Click the plus sign (+) next to the `Property validator(s)` checkbox. This will add an empty property validator function (`findMedianSortedArraysValidator1`) to the bottom of the file.
2. Copy and paste the following code into the body of your function:

```TypeScript
export function findMedianSortedArraysValidator1(r: FuzzTestResult): boolean {
  /* BEGIN copying/pasting here: */
  // Number of smaller vals == number of larger vals
  let numSmaller = 0, numLarger = 0, numEqual = 0;
  const concatArray = r.in[0].concat(r.in[1]);
  concatArray.forEach((e) => {
    if (e < r.out) ++numSmaller;
    else if (e > r.out) ++numLarger;
    else ++numEqual;
  })
  if (numSmaller === numLarger){
    return true;
  } else {
    // Means there are value(s) in the array equal to median. Don't count the median itself (numEqual-1).
    return (numEqual-1+numSmaller === numLarger ||
            numEqual-1+numLarger === numSmaller);
  }
  /* END copying/pasting here */
}
```

> **Tip**: You can write most any code you want inside your property validator function, including if statements, loops, and so on.

3. Back in the NaNofuzz screen, change the range for `nums1` and `nums2` to `Min value` = 0, `Max value` = 10.
4. Click `Test`.
5. Which tests failed/passed?
6. Click the arrow (>) in the header of the results grid to the right of the robot icon to see all the property validator results.

### Sorting the columns

Sorting or changing input ranges can be helpful when trying to generalize inputs

7. On the Failed tab, click the header of the `input:nums1` column to sort the results in ascending order.
8. Click the header again to sort in descending order.

### Generalizing buggy inputs

Let's try to understand what types of inputs cause incorrect behavior. If we look through the results grid, it seems like many of the `failed` tests have input arrays that are not sorted. But many of the `passed` tests are also not sorted—there must be something more complex occurring.

So what kinds of inputs elicit _incorrect_ behavior?

- Inputs such that when the two arrays are merged, the median value (or the middle two values, if the length is odd) does not fall at the middle index.

> **Note**: The reason for the bug is that the function assumes the input arrays are already sorted! It merges `nums1` and `nums2` into one "sorted" array and takes the middle value as the median. (Or the average of the middle two values, if the length is odd).

## Conclusion

Testing with NaNofuzz is as simple as setting input ranges, selecting validators, clicking `Test`, and reading the results.

- The `heuristic validator` (the bug icon) is useful for quickly finding buggy edge cases.
- The `human validator` (the person icon) is useful for marking specific examples as passed or failed.
- The `property validator` (the robot icon) is useful for automatically testing complex properties.

When first encountering a new program, try running with the default settings first (`heuristic validator`). Then mark some results as passed or failed with the `human validator`. Then write a `property validator` to check the rest.

