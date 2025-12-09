/*
 * @Date: 2025-12-09 20:24:17
 * @Description: 
 */
let arr = [1, [2, [3, [4, 5, [6, 7]]]], 8];
let str = JSON.stringify(arr);

// 方法1
// const res = arr.flat(Infinity);

// console.log(res); // [1, 2, 3, 4, 5, 6, 7, 8]


// 方法2
const flatFunc = (arr,depth)=>{
    // 注意是depth > 0 不是Array.isArray(arr)
    return depth > 0?
    arr.reduce((acc,next)=>{
        return acc.concat(Array.isArray(next)?flatFunc(next,depth - 1):next)
    },[])
    :arr.slice()
}

const res = flatFunc(arr,Infinity)
console.log(res); // [1, 2, 3, 4, 5, 6, 7, 8]