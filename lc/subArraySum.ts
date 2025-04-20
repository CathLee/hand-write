
// 560. 和为 K 的子数组
// 1.前缀和-某个前缀和 = k即可证明存在有k个数组的和
// 2.time = time+res.get(target)(

function subarraySum(nums: number[], k: number): number {
    const res = new Map()

    let prefixAll = 0
    let time = 0
    res.set(0, 1)
    for (let i = 0; i < nums.length; i++) {
        prefixAll = prefixAll + nums[i]
        let target = prefixAll - k
        if (res.has(target)) {
            time += res.get(target)
        }
        res.has(prefixAll) ? res.set(prefixAll, res.get(prefixAll) + 1) : res.set(prefixAll, 1)

    }
    return time
};