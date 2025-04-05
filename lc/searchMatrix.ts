// 74.搜索二维矩阵
// 1.二次二分
// 2.while条件要加等号（<=

function searchMatrix(matrix: number[][], target: number): boolean {
    let low = 0;
    let hight = matrix.length - 1
    let startIndex = -1
    while(low<=hight){
        let mid = low + Math.floor((hight - low) / 2)
        if(matrix[mid][0] === target) return true
        if(matrix[mid][0]<target){
            startIndex = mid
            low = mid+1
        }else{
            hight = mid - 1
        }
    }
    
    if(startIndex === -1) return false

    const currentArr = matrix[startIndex]
    let left = 0
    let right = currentArr.length - 1
    while (left <= right) {
        let mid = left + Math.floor((right - left) / 2)
               
        if(currentArr[mid] === target){
            return true
        }
        if (currentArr[mid] < target) {
            left = mid + 1
        }else{
             right = mid - 1
        }
    }
    return false
};