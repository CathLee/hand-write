
// 15. 三数之和
// 1.排序后双指针，无需二分查找，
// 2.左右搜索在前（sum>0,sum<0），sum == 0在后
// 3.去重判断二重while，先判断再增减
function threeSum(nums: number[]): number[][] {
    const sorted = nums.sort((a, b) => a - b)
    const res = []
    for (let i = 0; i < sorted.length; i++) {
        let k = sorted.length - 1;
        let j = i + 1
        if (sorted[i] > 0) break
        if (sorted[i] === sorted[i - 1]) {
            continue
        }
        while (j < k) {
            const sum = sorted[i] + sorted[j] + sorted[k]
            
            if (sum < 0) {
                j++
            }

            if (sum > 0) {
                k--
            }
            if (sum === 0) {
                res.push([sorted[i], sorted[j], sorted[k]])
                while (j < k && sorted[j] === sorted[j + 1]) {
                    j++
                }
                while (j < k && sorted[k] === sorted[k - 1]) {
                    k--
                }
                j++
                k--
            }
        }

    }
    return res
}
