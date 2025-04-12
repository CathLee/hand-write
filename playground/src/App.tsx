/*
 * @Date: 2025-04-12 10:45:19
 * @Description:
 */
import { ErrorInfo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import MyErrorBoundary from "../../react-hand-write/component/ErrorBoundary";
import { useErrorBoundary } from "react-error-boundary";
import "./App.css";

function InnerApp() {
  const [count, setCount] = useState(0);
  const { showBoundary } = useErrorBoundary();

  const handleClick = () => {
    if (count === 4) {
      showBoundary(new Error("我是一个测试错误！"));
      return;
    }
    setCount(count + 1);
  };

  return (
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
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
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
