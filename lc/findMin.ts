// 153. 寻找旋转排序数组中的最小值
// 1.while l<r可以不写=，因为查找到相等的值的时候无需再次比较
// 2.比较mid落在的区间分为两种
// a.mid落在第一段，且第一段中的所有元素都比第二段大
// b.mid落在第二段，且第二段就是最小的元素所在的段
function findMin(nums: number[]): number {
    let l = 0;
    let r = nums.length-1
    while(l<r){
        const mid = Math.floor((r+l)/2)
        // mid 在反转数组的第一段
        if(nums[mid]>nums[r]){
            l = mid + 1
        }else{
            // mid 在反转数组的第二段
            r = mid
        }
    }
    return nums[l]
};