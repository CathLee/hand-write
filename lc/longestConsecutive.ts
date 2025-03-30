// 128. 最长连续序列
// hasSet去重，头尾夹逼定理去寻找item
function longestConsecutive(nums: number[]): number {
    const hashSet = new Set()
    if(nums.length === 0){
        return 0
    }
    let numberLength = 1
    nums.forEach((item)=>{ 
        hashSet.add(item)
    })
    hashSet.forEach((value)=>{
        let currentNum = value
        let currentLength = 1
        let head = Number(value) - 1
        // 当前数为开头
        if(!hashSet.has(head)){
            // 查找尾部
            let tail = Number(currentNum)+1;
            while(hashSet.has(tail)){
                currentLength++
                tail++
            }
        }
        numberLength = Math.max(numberLength,currentLength)
    })
    return numberLength
};