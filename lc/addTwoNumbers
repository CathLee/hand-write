// 2. 两数相加

/**tips：
const sum = (l1Val + l2Val + add)
        sum >= 10 ? add = 1 : add = 0
        cur.next = new ListNode(sum%10)
 */
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
function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const res = new ListNode(0)
    let add = 0
    let cur = res
    while (l1 || l2 || add) {
        let l1Val = l1 === null ? 0 : l1.val
        let l2Val = l2 === null ? 0 : l2.val
        const sum = (l1Val + l2Val + add)
        sum >= 10 ? add = 1 : add = 0
        cur.next = new ListNode(sum%10)
        cur = cur.next
        if (l1 !== null) {
            l1 = l1.next
        }
        if (l2 !== null) {
            l2 = l2.next
        }
    }
    return res.next
};
