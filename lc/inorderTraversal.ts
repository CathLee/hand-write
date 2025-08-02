/*
 * @Date: 2025-05-12 21:20:54
 * @Description: 
 */

// 94. 二叉树的中序遍历
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


// method 1:我们先递归左子树，再访问根节点，接着递归右子树。
function inorderTraversal(root: TreeNode | null): number[] {
    const res = []
    const inorder = (root: TreeNode | null) => {
        if (!root) return
        inorder(root.left)
        res.push(root.val)
        inorder(root.right)
    }
    inorder(root)
    return res
};


// method 2: 迭代法
// 1.定义一个栈 list
// 2.将树的左节点依次入栈
// 3.左节点为空时，弹出栈顶元素并处理
// 4.重复 2-3 的操作

function inorderTraversal(root: TreeNode | null): number[] {
    let list = []
    let res = []
    while (root || list.length) {
        if (root) {
            list.push(root)
            root = root.left
        }else{
            root = list.pop()
            res.push(root.val)
            root = root.right
        }
    }
    return res
};