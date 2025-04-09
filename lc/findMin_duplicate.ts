// 154. 寻找旋转排序数组中的最小值 II
// 1.重复的排序数组，只需要解决最右边的值和mid值相等时，需要重置最右边的值进行左移一位进行比较即可。
function findMin(nums: number[]): number {
    let l = 0;
    let r = nums.length-1
    while(l<r){
        const mid = Math.floor((r+l)/2)
        // mid 在反转数组的第一段
        if(nums[mid]>nums[r]){
            l = mid + 1
        }else if(nums[mid]==nums[r]){
            r = r-1
        }else{
            // mid 在反转数组的第二段
            r = mid
        }
    }
    return nums[l]
};