// const containsNearbyDuplicate = (nums, k) => {
//     let flag = false;
//     const a = nums.forEach((e, i) => {
//         if (nums.indexOf(e) !== i) {
//             console.log(nums.indexOf(e) - i);
//             if (Math.abs(nums.indexOf(e) - i) <= k) {
//                 flag = true;
//             } else {
//                 flag = false;
//             }
//         }
//     })
//     const b = nums.toReversed()
//     b.forEach((e, i) => {
//         if (nums.indexOf(e) !== i) {
//             console.log(nums.indexOf(e) - i);
//             if (Math.abs(nums.indexOf(e) - i) <= k) {
//                 flag = true;
//                 yield
//             } else {
//                 flag = false;
//             }
//         }
//     })

//     return flag
// };

// const a = containsNearbyDuplicate([1,0,1,1], 1)
// console.log(a);


// 上述均为bad案例都是错误的
// 这道题目主要是采用滑动窗口的思想
const remove = (nums,k)=>{
    const set  = new Set()
    for(let i = 0;i<nums.length;i++){
        if(set.has(nums[i])){
            // 如果set中已经存在该元素，则返回true，因为这个时候说明当前的元素和前一个重复的元素已经隔着k个元素了
            return true
        }
        set.add(nums[i])
        if(set.size>k){
            // 保持set中最多有k个元素
            set.delete(nums[i-k])
        }
    }
    return false
}

const a = remove([1,0,1,1], 1)
console.log(a);