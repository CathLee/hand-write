/*
 * @Date: 2025-04-12 10:45:19
 * @Description:
 */
import { ErrorInfo, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import MyErrorBoundary from "../../react-hand-write/component/ErrorBoundary";
import { useErrorBoundary } from "react-error-boundary";
import useLastest from '../../react-hand-write/hook/useLastest'
import VideoLoaderDemo from './VideoLoaderDemo';
import "./App.css";

function InnerApp() {
  const [currentDemo, setCurrentDemo] = useState<'hooks' | 'video'>('hooks');
  const [count, setCount] = useState(0);
  const { showBoundary } = useErrorBoundary();
  // 测试useLatest
  const latestCount = useLastest(count);
  
  // 测试ErrorBoundary
  const handleClick = () => {
    if (count === 4) {
      showBoundary(new Error("我是一个测试错误！"));
      return;
    }
    setCount(count + 1);
  };

  // 测试闭包
  useEffect(()=>{
    if (currentDemo !== 'hooks') return;
    
    const interval = setInterval(() => {
      console.log(`Current count: ${count}`);
      // setCount(count + 1); // This always increments from original count value
      setCount(latestCount.current+1) // This will set the latest value
    }, 1000);
    return () => clearInterval(interval);
  },[currentDemo])

  return (
    <div>
      {/* 导航栏 */}
      <nav style={{ marginBottom: '20px', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <button 
          onClick={() => setCurrentDemo('hooks')}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: currentDemo === 'hooks' ? '#007acc' : '#f0f0f0',
            color: currentDemo === 'hooks' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Hooks 演示
        </button>
        <button 
          onClick={() => setCurrentDemo('video')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: currentDemo === 'video' ? '#007acc' : '#f0f0f0',
            color: currentDemo === 'video' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          视频加载器演示
        </button>
      </nav>

      {/* 内容区域 */}
      {currentDemo === 'video' ? (
        <VideoLoaderDemo />
      ) : (
        <div>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <button onClick={handleClick}>count is {count}</button>
          </div>
          <div>
            测试闭包问题 - useLatest Hook
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error("错误被捕获了！", error);
    console.error("组件堆栈信息：", info);
  };

  return (
    <>
      <MyErrorBoundary onError={handleError}>
        <InnerApp />
      </MyErrorBoundary>
    </>
  );
}

export default App;
