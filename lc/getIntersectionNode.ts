// 160. 相交链表
// 1.temp = temp.next
// 2.走过你走过的路就算是相交

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

function getIntersectionNode(headA: ListNode | null, headB: ListNode | null): ListNode | null {
    const visted = new Set()
    let temp = headA

    while(temp){
        visted.add(temp)
        temp = temp.next
    }
    temp = headB
    while(temp){
        if(visted.has(temp)){
            return temp
        }
        temp = temp.next
    }
    return null;
};