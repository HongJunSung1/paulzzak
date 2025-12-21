import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import 'tui-grid/dist/tui-grid.css';         // ✅ 그리드 라이브러리 기본
import './styles/p-esg-common-grid.overrides.css'; // ✅ 그리드 전역 덮어쓰기(체크박스 등)
import './App.css';                          // (기존 App 전역 스타일)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>  
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
