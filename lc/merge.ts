// 56. 合并区间
// 1.先把数组按升序排序
// 2.左边最大大于等于右边最小，temp 重置为[左最小，max]，否则重置为currentItem
function merge(intervals: number[][]): number[][] {
    if (intervals.length === 0) return [];
    // 按每个区间的开头大小排序
    intervals.sort((a, b) => {
        return a[0] - b[0];
    });

    const arr = []
    let temp = intervals[0]
    for (let i = 0; i < intervals.length; i++) {
        const l = temp[1]
        const r = intervals[i][0]
        if (l >= r) {
            const max = Math.max(temp[1], intervals[i][1])
            temp = [temp[0], max]

        } else {
            arr.push(temp)
            temp = intervals[i]
        }
    }
    arr.push(temp)

    return arr
};