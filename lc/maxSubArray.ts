// 53. 最大子数组和
// 贪心算法
// 1.一旦和为负数，再加也是变小。
// （及时止损，为负就重开
function maxSubArray(nums: number[]): number {
    let max = nums[0]
    let sum = 0
    nums.forEach((item)=>{
        sum = sum +item
        if(sum>max){
            max = sum
        }
        if(sum<0){
            sum = 0
        }
    })
    return max
};