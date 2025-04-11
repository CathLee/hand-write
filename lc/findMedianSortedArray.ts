// 复杂度O(m+n)
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    const arr = [...nums1,...nums2].sort((a,b)=>a-b)
    let l = 0;
    let r = arr.length -1;
     const mid = Math.floor((l+r)>>1)
     if(arr.length%2 !== 0){
        return arr[mid]
     }else{
     return (arr[mid]+arr[mid+1])/2
     }
};

// 复杂度 Olog(m+n)

function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    const len1 = nums1.length;
    const len2 = nums2.length;
    const mid = (len1 + len2 + 1) >> 1;
    const left = findK(nums1, nums2, 0, 0, mid);
    // 判断总长度奇偶
    if ((len1 + len2) % 2) {
        return left;
    } else {
        const right = findK(nums1, nums2, 0, 0, mid + 1);
        return (left + right) / 2
    }

};

function findK(nums1, nums2, start1, start2, k) {
     const len1 = nums1.length;
    const len2 = nums2.length;
    /* 特例 */
    // nums1 数组的元素排除完
    if (len1 === start1) return nums2[start2 + k - 1];
    if (len2 === start2) return nums1[start1 + k - 1];
    // 排除到只剩两个元素取最小 即剩余元素的最小值
    if (k === 1) return Math.min(nums1[start1], nums2[start2]);

    /* 通常情况 */
    // 取k的一半 同时注意可能会超出数组长度 最多取数组最后一个元素
    const i = start1 + Math.min(len1, k >> 1) - 1;
    const j = start2 + Math.min(len2, k >> 1) - 1;
    // j 前面的所有元素被排除了 同时缩减k的值
    if (nums1[i] > nums2[j]) {
        return findK(nums1, nums2, start1, j + 1, k - (j - start2 + 1));
    } else {
        return findK(nums1, nums2, i + 1, start2, k - (i - start1 + 1));
    }
}

