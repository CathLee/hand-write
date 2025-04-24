// 234.回文子串

// 1.循环法

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

function isPalindrome(head: ListNode | null): boolean {
    let arr = []
    while (head) {
        arr.push(head.val)
        head = head.next
    }
    let tail = arr.length - 1
    let pre = 0
    while (pre < tail) {
        if (arr[pre] != arr[tail]) {
            return false
        }
        pre++
        tail--
    }
    return true
};

// 2.快慢指针
// tips:
// 1.findMid找到中间头，快慢指针找，快的走两格，慢的走一格
// 2.找到中间头进行翻转，形成链表head2
// 3.比对head和head2的每个元素是否一致
function findMid(head) {
    let fast = head
    let slow = head
    while (fast && fast.next) {
        slow = slow.next
        fast = fast.next.next
    }
    return slow
}

function reverse(head){
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

function isPalindrome(head: ListNode | null): boolean {
    const mid = findMid(head)
    let head2 = reverse(mid)
    while(head2){
        if(head.val!==head2.val){
            return false
        }
        head = head.next
        head2 = head2.next
    }
    return true
};