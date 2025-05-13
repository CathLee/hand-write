/*
 * @Date: 2025-05-13 21:08:22
 * @Description: 
 */
// 543. 二叉树的直径
// 1.左右树的深度（deep level取最大值
/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function diameterOfBinaryTree(root: TreeNode | null): number {
    let ans = 0;
    const dfs = (root: TreeNode | null) => {
        if (!root) return -1
        const levelLeft = dfs(root.left) + 1
        const levelRight = dfs(root.right) + 1
        ans = Math.max(ans, levelLeft + levelRight); // 两条链拼成路径
        return Math.max(levelLeft, levelRight);
    }
    dfs(root)
    return ans
};