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