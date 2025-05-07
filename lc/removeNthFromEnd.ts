/*
 * @Date: 2025-05-07 19:01:38
 * @Description: 
 */
// 19. 删除链表的倒数第 N 个结点
// tips:
// 1. const h2 = reverse(dummy.next)
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

function reverse(head: ListNode | null): ListNode | null {
    let pre = null
    let cur = head
    while (cur) {
        let temp = cur.next
        cur.next = pre
        pre = cur
        cur = temp
    }
    return pre
}

function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
    const h1 = reverse(head)
    let dummy = new ListNode(0, h1)
    let cur = dummy
    let pre = null
    let i = 0
    while (i <n) {
        pre = cur
        cur = cur.next
        i++
    }
    let temp = cur.next
    pre.next = temp


    const h2 = reverse(dummy.next)
    return h2
};