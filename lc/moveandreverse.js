const arr = [1,2,3,4,5,6,7]
const k = 3
const a = arr.slice(arr.length-k,arr.length)
const b = arr.slice(0,k+1)
console.log(a);
console.log(b);
const res = a.concat(b)
console.log(JSON.stringify(res));

