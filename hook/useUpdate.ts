
import { useRef,useState ,useCallback,useEffect,} from 'react';

// 封装一个useRef
function useLastest<T>(initialValue: T): { current: T } {
  const ref = useRef<T>(initialValue);
  ref.value = initialValue
  return ref;
}

// 为什么这里要用useCallback呢？
// 为什么不用useEffect呢？
// 答案是：useEffect会在组件渲染完成后执行，而useCallback会在组件渲染时执行，这样就可以保证每次渲染时都是最新的状态了。
//  
// 封装一个use获取组建最新状态的组件
function useUpdate(){
  const [,setState] = useState({})
  return useCallback(()=>{setState({})},[])
}

export const isFunction = (fn:unknown):fn is Function => typeof fn === 'function'

function useMount(fn){
  useEffect(()=>{
    fn?.()
  },[])
}


function useUnmounted(fn:()=>void){
  const fnRef = useLastest(fn)
  // useEffect(()=>{
  //   return ()=>{
  //     fn?.current()
  //   }
  // },[])
  
  useEffect(()=>{
    ()=>()=>{
      fnRef?.current()
    }
  })
}
const a = async (input)=>{
  const res = await fetch(input)
  input.a = res
  return input
}

const b = a('dd')
// 这个时候为什么b是一个promise呢？
// 因为a是一个async函数，async函数返回的是一个promise

