/*
 * @Date: 2025-05-13 20:58:21
 * @Description: 
 */
// 226. 翻转二叉树

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



// dfs递归
function invertTree(root: TreeNode | null): TreeNode | null {
    const dfs = (root: TreeNode | null)=>{
        if(!root) return null
        let temp = root.left
        root.left = root.right
        root.right = temp
        dfs(root.left)
        dfs(root.right)
        return root
    }
    dfs(root)
    return root
}


// 直接递归
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

function invertTree(root: TreeNode | null): TreeNode | null {
    if(!root) return null
    let temp = root.left
    root.left = invertTree(root.right)
    root.right = invertTree(temp)
    return root
};