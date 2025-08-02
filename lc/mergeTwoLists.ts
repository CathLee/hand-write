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

function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    let dmy = new ListNode(0, null);
    let list = dmy
    while(list1&&list2){
        if(list1.val<list2.val){
            list.next = list1
            list1 = list1.next
        }else{
            list.next = list2
            list2 = list2.next
        }
        list = list.next
    }

    if(list1 === null) list.next = list2
    if(list2 === null) list.next = list1
    return dmy.next
    
};   
