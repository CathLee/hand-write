
function twoSum(nums: number[], target: number): number[] {
    const helpMap = new Map()
    let resArr = []
    let index = null
    nums.forEach((item,idx)=>{
        const targetRes = target - item
        index = helpMap.get(targetRes);
        if(index!==undefined){
            resArr = [idx,index]
        }
        helpMap.set(item,idx)
    })  
    return resArr
};