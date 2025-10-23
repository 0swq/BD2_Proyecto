class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
class Solution(object):
    #[3,0,2,6,8,1,7,9,4,2,5,5,0]
    def spiralMatrix(self, m, n, head):
        head_node = ListNode(val = head[0])
        res = [[-m for _ in range(m)] for _ in range(n)]
        lado= m
        ancho = n
        act=0
        for columna in res:
            for fila in res[0]:
                fila = ListNode(head[act],next= head[act+1])
                act+=1





