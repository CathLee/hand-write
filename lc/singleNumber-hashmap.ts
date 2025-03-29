function singleNumber(nums: number[]): number {
    let helpMap = new Map()
    let number
    nums.forEach((item, index) => {
        const tgtIndex = helpMap.get(item) ?? 0
        const res = tgtIndex + 1
        helpMap.set(item, res)
    })

    helpMap.forEach((value, key) => {
        if (value === 1) {
            number = key
        }
    })
    return number
};