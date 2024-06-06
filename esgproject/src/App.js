import React,{useEffect, useState} from 'react';

import {Container, DataContainer} from "./App.styles.tsx";
import { Routes, Route, useLocation  } from 'react-router-dom'

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';
import Loading from './ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Tab     from './ESG-common/Tab/p-esg-common-Tab.tsx';
import {MenuInfoProvider} from './hooks/use-menu-info.tsx';

// 화면 영역
import Login from './ESG-login/p-esg-login.tsx';
import Main from './ESG-form/main/p-esg-form-main.tsx';
import Environmental from './ESG-form/test/p-esg-form-test.tsx';
import UserInfo from './ESG-form/admin/p-esg-form-admin-userInfo.tsx';
import FormReg from './ESG-form/admin/p-esg-form-admin-form-reg.tsx';
import Menu from './ESG-form/menu/p-esg-form-menu-reg.tsx';
import UserForm from './ESG-form/admin/p-esg-user-form.tsx';


function App() {

  // 전역적으로 오류를 처리합니다.
window.onerror = function (message, source, lineno, colno, error) {
  // console.error("Global error caught:", message, source, lineno, colno, error);
  if(message == "Uncaught TypeError: Cannot read properties of null (reading 'clientHeight')"){
    alert("ASdasd");
    return true;// 오류가 브라우저 콘솔에 출력되지 않도록 합니다.
  }
  return false; // 다른 오류는 콘솔 출력
};


  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  const [isLoading,setIsLoading] = useState(false);

  useEffect(() => {
    // 페이지 이동 전 이벤트
    setIsLoading(true);
    // 페이지 이동 후 이벤트
    const handleComplete = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // 원하는 로딩 시간 설정
    };

    handleComplete();
  }, [location]);

  return (      
  <div className="App" style={{backgroundColor:"#faf9f8"}}>
      {isLoginPage && 
        <Routes>
          <Route path="/" exact element={<Login/>}></Route>
        </Routes>
      }
      {!isLoginPage && 
        <>
          <Navbar/>
          <Container>
            <MenuInfoProvider>
              <SideBar/>  
              <DataContainer>
              <Loading loading={isLoading}/>
                <Tab/>
                <Routes>
                  {/* 실제 데이터 작성 구간 */}
                    <Route path="/main" element={<Main/>}></Route>
                    <Route path="/environmental" element={<Environmental/>}></Route>
                    <Route path="/PEsgFormAdminUserInfo" element={<UserInfo/>}></Route>
                    <Route path="/PEsgFormAdminFormReg" element={<FormReg/>}></Route>
                    <Route path="/PEsgFormMenuReg" element={<Menu/>}></Route>
                    <Route path="/PEsgUserForm" element={<UserForm/>}></Route>
                  {/* 실제 데이터 작성 구간 */}
                </Routes>
              </DataContainer>
            </MenuInfoProvider>
          </Container>
        </>
      }
  </div>
  );  
}

export default App;
