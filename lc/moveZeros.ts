/**
 Do not return anything, modify nums in-place instead.
 */

//  双指针（同一起点
//  283. 移动零
 function moveZeroes(nums: number[]): void {
    let j = 0
    for(let i = 0;i<nums.length;i++){
        if(nums[i] !== 0){
            let temp = nums[j];
            nums[j] = nums[i]
            nums[i] = temp
            j++
        }

    }
};