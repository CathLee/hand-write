const remove = (nums) => {
    let res = []
    res.push(nums[0])
    nums.forEach((item, index) => {
        if (item !== res[res.length - 1]) {
            res.push(item)
        }
    })
    return res.length
}

const removeDuplicates =function (nums) {
    const res =  nums.filter((item,index,arr)=>{
        if(arr.indexOf(item) === index){
            return item
        }
    })
    return res.length
}

const a = removeDuplicates([1,1,2])
console.log(a);