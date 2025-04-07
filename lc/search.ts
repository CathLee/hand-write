// 33. 搜索旋转排序数组
// 1.target可以等于左右left right值
// 2.使用区间去思考,思考mid落在了左边区间[left,mid]或者 落在右边区间[mid,right]区间的情况
function search(nums: number[], target: number): number {
    let left  = 0;
    let right = nums.length-1
    while(left<=right)
    {
        const mid = Math.floor((left+right)/2)
        if(target === nums[mid]){
            return mid
        }
        // 落在了左边区间[left,mid]
        if(nums[mid]>=nums[left]){
            if(nums[mid]>target&&target>=nums[left]){
                right = mid-1
            }else{
                left = mid+1
            }
        }else{
            // 落在右边区间[mid,right]
            if(nums[mid]<target&&target<=nums[right]){
                left = mid+1
            }else{
                right = mid-1
            }
        }
    }
    return -1
};