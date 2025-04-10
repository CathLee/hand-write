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

