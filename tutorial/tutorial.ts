import { FuzzTestResult } from "@nanofuzz/runtime";
/**
 * Adapted from: https://leetcode.com/problems/median-of-two-sorted-arrays/solutions/828509/my-typescript-solution-efficient/
 * 
 * Given two arrays, returns the median value appearing in either 
 * array. If both arrays are empty, the median is undefined.
 * 
 * In the case of an even number of elements, return the mean of 
 * the two elements closest to the median.
 * 
 * Example:
 * - [1],[5,4,7] yields 4.5
 * - [7],[4,5] yields 5
 * - [1],[] yields 1
 * 
 * @param nums1 array of integers
 * @param nums2 array of integers
 * @returns median 
 */
export function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  let arr: number[] = [];
  //merge 2 arrays into 1
  while(nums1.length && nums2.length){
      if(nums1[0]<=nums2[0]){
          arr.push(nums1.shift()!);
      } else{
          arr.push(nums2.shift()!);
      }
  }
  // merge some leftover numbers
  if(!nums1.length){
      arr = arr.concat(nums2);
  } else if(!nums2.length){
      arr = arr.concat(nums1);
  }
  //return different calculation depend on even or odd arr length
  if(!(arr.length % 2)){
      return (arr[arr.length/2] + arr[arr.length/2 -1])/2
  } else{
      return arr[Math.floor(arr.length/2)]
  }
};

export function findMedianSortedArraysValidator(r: FuzzTestResult): boolean {
  // Median is between min and max val in arrays
  const concatArray = r.in[0].concat(r.in[1]);
  const min = Math.min(...concatArray);
  const max = Math.max(...concatArray);
  return (r.out >= min && r.out <= max);
}