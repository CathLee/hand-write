// 141. 环形链表
// 1.set head 而不是set head.val
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function hasCycle(head: ListNode | null): boolean {
    let arr = new Set()
    while(head){
        if(arr.has(head)){
            return true
        }
        arr.add(head)
        head = head.next
    }
    return false
};