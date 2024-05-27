import React from 'react';

import {Container, DataContainer} from "./App.styles.tsx";
import { Routes, Route, useLocation } from 'react-router-dom'

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';

// 화면 영역
import Login from './ESG-login/p-esg-login.tsx';
import Main from './ESG-form/main/p-esg-form-main.tsx';
import Environmental from './ESG-form/test/p-esg-form-test.tsx';
import Admin from './ESG-form/admin/p-esg-form-admin.tsx';


function App() {

  const location = useLocation();
  const isLoginPage = location.pathname === '/';

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
            <SideBar/>  
            <DataContainer>
              <Routes>
                {/* 실제 데이터 작성 구간 */}
                  <Route path="/main" element={<Main/>}></Route>
                  <Route path="/environmental" element={<Environmental/>}></Route>
                  <Route path="/admin" element={<Admin/>}></Route>
                {/* 실제 데이터 작성 구간 */}
              </Routes>
            </DataContainer>
          </Container>
        </>
      }
  </div>
  );  
}

export default App;
