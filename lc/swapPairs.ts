/*
 * @Date: 2025-05-08 20:58:17
 * @Description: 
 */
// 24. 两两交换链表中的节点
// pre.next.next = cur
// 三指针
// 1.dummy，dummy.next = head
// 2.pre
// 3.cur

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

function swapPairs(head: ListNode | null): ListNode | null {
    if (!head?.next) return head
    const dummy = new ListNode(-1, head)

    let prev = dummy
    let node = stepTo(prev, 1)

    while (node) {
        const next = stepTo(node, 1)
        const nextNext = stepTo(node, 2)
        if (next) {
            prev.next = next
            next.next = node
            node.next = nextNext
        }

        prev = node
        node = nextNext
    }

    return dummy.next
};

function stepTo(head: ListNode | null, step: number) {
    while (head && step-- > 0) {
        head = head.next
    }

    return head
}