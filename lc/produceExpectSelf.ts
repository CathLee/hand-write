
// 238. 除自身以外数组的乘积
// 1.前缀和乘以后缀和
function productExceptSelf(nums: number[]): number[] {
    let allPrefix = 1
    let allSubfix = 1
    let leftRes = []
    let rightRes = []
    let res = []
    leftRes.push(allPrefix)
    rightRes[nums.length-1] = allSubfix
    for(let i = 1;i<nums.length;i++){
        allPrefix = nums[i-1]*allPrefix
        leftRes.push(allPrefix)
    }

    for(let j = nums.length-1;j>=0;j--){
        allSubfix = nums[j]*allSubfix
        rightRes[j-1]=allSubfix
    }

    for(let k = 0;k<nums.length;k++){
       const target = leftRes[k]*rightRes[k]
       res.push(target)
    }
    return res
};