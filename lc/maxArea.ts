// 11. 盛最多水的容器

// 1.前后双指针
// 2.只移动小的
// 3.if else ;双if 会导致一增后又一减
function maxArea(height: number[]): number {
    let left = 0;
    let max = 0
    let right = height.length - 1
    while (left < right) {
        const water = Math.min(height[left], height[right]) * (right - left);
        max = Math.max(max,water)
        if (height[left] <= height[right]) {
            left ++
        }else{
            right--
        }

    }
    return max
};