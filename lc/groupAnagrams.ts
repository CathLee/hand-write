// 49. 字母异位词分组
// 使用排序后的hashmap，同时结合Arrayfrom返回map.values()
function groupAnagrams(strs: string[]): string[][] {
    const hashMap = new Map()
    strs.forEach((item) => {
        const target = item.split('').sort().join('');
        let targetArr = hashMap.get(target)??[]
        targetArr = [...targetArr,item]
        hashMap.set(target, targetArr)
    })
    return Array.from(hashMap.values());    
};