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

function sortList(head: ListNode | null): ListNode | null {
    const dummy = new ListNode(-Infinity); // 虚拟头节点，简化插入逻辑
    let curr = head;

    while (curr) {
        // 保存下一个节点，因为curr的next会被修改
        const nextNode = curr.next;

        // 内层循环：在已排序链表(dummy)中找到插入位置的前驱节点
        let prev = dummy;
        while (prev.next && prev.next.val < curr.val) {
            prev = prev.next;
        }

        // 将curr插入到prev之后
        curr.next = prev.next;
        prev.next = curr;

        curr = nextNode; // 处理下一个节点
    }

    return dummy.next;
}
