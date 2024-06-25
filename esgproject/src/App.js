import React,{useEffect, useState} from 'react';

import {Container, DataContainer} from "./App.styles.tsx";
import { Routes, Route, useLocation } from 'react-router-dom'

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
import SearchBoxReg from './ESG-form/admin/p-esg-form-admin-searchbox.tsx';
import CompanyReg from './ESG-form/setting/p-esg-company-reg.tsx';
import TableReg from './ESG-form/admin/p-esg-form-admin-table.tsx';
import BizUnitForm from './ESG-form/admin/p-esg-bizunit-form.tsx';

// 화면 : Environmental
import Scope1to2 from './ESG-form/environmental/scope1-2/p-esg-env-scope1-2.tsx';
import Scope3 from './ESG-form/environmental/scope3/p-esg-env-scope3.tsx';
import GeneralWaste from './ESG-form/environmental/waste-general/p-esg-env-general-waste.tsx';
import DesignatedWaste from './ESG-form/environmental/waste-designated/p-esg-env-designated-waste.tsx';
import ConstructionWaste from './ESG-form/environmental/waste-construction/p-esg-env-construction-waste.tsx';
import TotalWaste from './ESG-form/environmental/waste-total/p-esg-env-total-waste.tsx';

// 테스트 화면
import FileTest from './ESG-form/file-test/p-esg-form-file-test.tsx';


function App() {

  // 전역적으로 오류를 처리합니다.
  window.onerror = function (message, source, lineno, colno, error) {
    // console.error("Global error caught:", message, source, lineno, colno, error);
    if(message === "Uncaught TypeError: Cannot read properties of null (reading 'clientHeight')"){
      // console.error("숙변 사업 등장");
      return true;// 오류가 브라우저 콘솔에 출력 중지
    }
    return false; // 다른 오류는 콘솔 출력
  };  

  const [strOpenUrl,setStrOpenUrl] = useState('/main');
  const [openTabs,setOpenTabs] = useState([]);

  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  const [isLoading,setIsLoading] = useState(false);

  useEffect(() => {

    // 페이지 이동 전 이벤트
    setIsLoading(true);
    // 페이지 이동 후 이벤트
    const handleComplete = () => {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // 원하는 로딩 시간 설정
    };

    handleComplete();
  }, [strOpenUrl]);



  return (      
    <div className="App" style={{backgroundColor:"#faf9f8"}}>
        {isLoginPage && 
          <Routes>
            <Route path="/" exact element={<Login/>}></Route>
          </Routes>
        }
        {!isLoginPage && 
          <>
            <MenuInfoProvider>
            <Navbar strOpenUrl= {setStrOpenUrl}/>
            <Container>
                <SideBar strOpenUrl={setStrOpenUrl}/>  
                <DataContainer>
                <Loading loading={isLoading}/>
                  <Tab strOpenUrl={setStrOpenUrl} openTabs={setOpenTabs}/>
                  {/* <Routes> */}
                    {/* 실제 데이터 작성 구간 */}
                      {/* <Route path="/main" element={<Main/>}></Route>
                      <Route path="/environmental" element={<Environmental/>}></Route>
                      <Route path="/PEsgFormAdminUserInfo" element={<UserInfo/>}></Route>
                      <Route path="/PEsgFormAdminFormReg" element={<FormReg/>}></Route>
                      <Route path="/PEsgFormMenuReg" element={<Menu/>}></Route>
                      <Route path="/PEsgUserForm" element={<UserForm/>}></Route> */}
                    {/* 실제 데이터 작성 구간 */}
                  {/* </Routes> */}
                  <Main              strOpenUrl={strOpenUrl} openTabs={openTabs} />
                  <UserInfo          strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <FormReg           strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <Menu              strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <UserForm          strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <Environmental     strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <FileTest          strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <SearchBoxReg      strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <CompanyReg        strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <Scope3            strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <Scope1to2         strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <GeneralWaste      strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <DesignatedWaste   strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <ConstructionWaste strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <TableReg          strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <BizUnitForm       strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <TotalWaste        strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                </DataContainer>
            </Container>
            </MenuInfoProvider>
          </>
        }
    </div>
  );  
}

export default App;
