// 189. 轮转数组
// 1.k要取余
// 2.翻转整个，翻转前k个，翻转剩余

 /**
 Do not return anything, modify nums in-place instead.
 */
function rotate(nums: number[], k: number): void {
    let i = 0;
    let j = nums.length-1
    k = k % nums.length
    reverse(nums,i,j)
    reverse(nums,i,k-1)
    reverse(nums,k,j)
};

function reverse(nums: number[], start: number,end:number){
    while(start<end){
        let temp = nums[start]
        nums[start] = nums[end]
        nums[end] = temp
        start++
        end--
    }
}
