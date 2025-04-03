
// 35. 搜索插入位置
// 二分查找+递归
function searchInsert(nums: number[], target: number): number {
    return binary(nums, target, 0, nums.length - 1)
};

function binary(nums: number[], target: number, begin: number, end: number): number {

    if (begin >= end) {
        return nums[begin] >= target ? begin : begin + 1;
    }
    let mid = begin + Math.floor((end-begin)/2)

    if (target < nums[mid]) {
       return binary(nums, target, 0, mid - 1)
    }
    if (target > nums[mid]) {
       return binary(nums, target, mid + 1, end)
    }
    if (target === nums[mid]) {
        return mid
    }
};