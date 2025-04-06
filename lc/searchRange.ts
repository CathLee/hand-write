// 34. 在排序数组中查找元素的第一个和最后一个位置
// 1.O(logN)
// 2.找到为相同的target后，直接想左右两边分别查找边界，left = right = mid;使用while去找到左右的边界，即为head和tail
function searchRange(nums: number[], target: number): number[] {
    let left = 0;
    let right = nums.length - 1
    while (left <= right) {
        let mid = Math.floor((left + right) / 2)
        if (nums[mid] === target) {
            left = right = mid
            while (nums[left] === target) {
                left--
            }
            while (nums[right] === target) {
                right++
            }
            return [left + 1, right - 1]
        }
        if (nums[mid] < target) {
            left = mid + 1
        }
        if (nums[mid] > target) {
            right = mid - 1
        }
    }
    return [-1, -1]
};