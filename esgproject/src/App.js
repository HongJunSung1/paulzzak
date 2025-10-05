import React,{useEffect, useState} from 'react';

import {Container, DataContainer} from "./App.styles.tsx";
import { Routes, Route, useLocation } from 'react-router-dom'

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';
import Loading from './ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Tab     from './ESG-common/Tab/p-esg-common-Tab.tsx';
import {MenuInfoProvider} from './hooks/use-menu-info.tsx';

// 화면 영역 : Admin
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
import AlarmList from './ESG-form/environmental/alarm/p-esg-alarmlist.tsx';
import UserGroupReg from './ESG-form/admin/p-pz-user-group-form-reg.tsx';
import UserGroupForm from './ESG-form/admin/p-pz-user-group-form.tsx';

// 화면 : Stats
import GameRecordReg from './Form/stats/p-pz-stats-game-record-reg.tsx';
import TeamReg from './Form/team/p-pz-team-reg.tsx';
import PlayerInfoReg from './Form/player/p-pz-player-info-reg.tsx';
import PlayerInfoQuery from './Form/player/p-pz-player-info-query.tsx';
import GameRecordSummary from './Form/stats/p-pz-stats-game-record-summary.tsx';

// 화면 : 선수별 Stat
import PlayerStatsQuery from './Form/player-stats/p-pz-player-stats-query.tsx';

// 화면 : Environmental
import Scope1to2 from './ESG-form/environmental/scope1-2/p-esg-env-scope1-2.tsx';
import Scope3 from './ESG-form/environmental/scope3/p-esg-env-scope3.tsx';
import GeneralWaste from './ESG-form/environmental/waste-general/p-esg-env-general-waste.tsx';
import DesignatedWaste from './ESG-form/environmental/waste-designated/p-esg-env-designated-waste.tsx';
import ConstructionWaste from './ESG-form/environmental/waste-construction/p-esg-env-construction-waste.tsx';
import TotalWaste from './ESG-form/environmental/waste-total/p-esg-env-total-waste.tsx';

// 화면 : Social
import DirectEmployment from './ESG-form/social/direct-employment/p-esg-soc-direct-employment.tsx';
import InDirectEmployment from './ESG-form/social/indirect-employment/p-esg-soc-indirect-employment.tsx';
import AgeEmployment from './ESG-form/social/age-employment/p-esg-soc-age-employment.tsx';
import CountryEmployment from './ESG-form/social/country-employment/p-esg-soc-country-employment.tsx';
import RegionEmployment from './ESG-form/social/region-employment/p-esg-soc-region-employment.tsx';
import PositionEmployment from './ESG-form/social/position-employment/p-esg-soc-position-employment.tsx';
import JobEmployment from './ESG-form/social/job-employment/p-esg-soc-job-employment.tsx';
import DonationAmount from './ESG-form/social/donation-amount/p-esg-soc-donation-amount.tsx';
import VolunteerEmployment from './ESG-form/social/volunteer-employment/p-esg-soc-volunteer-employment.tsx';
import WorkYear from './ESG-form/social/avg-workyear/p-esg-soc-avg-workyear.tsx';
import WonderWoman from './ESG-form/social/so-hot-wonderwoman/p-esg-soc-so-hot-wonderwoman.tsx';
import SocialWeakness from './ESG-form/social/social-weakness/p-esg-soc-social-weakness.tsx';
import HiredEmployment from './ESG-form/social/hired-employment/p-esg-soc-hired-employment.tsx';
import RetiredEmployment from './ESG-form/social/retired-employment/p-esg-soc-retired-employment.tsx';

// 화면 : Settings
import CountryReg from './ESG-form/settings/country-reg/p-esg-set-country-reg.tsx';

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
  const [jumpRowData, setJumpRowData] = useState(null); // 점프용 로직 추가

  const [openTabs,setOpenTabs] = useState([]);

  const location = useLocation();
  // const isLoginPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/' && !sessionStorage.getItem('userInfo');
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
            <Route path="/" exact element={<Login strOpenUrl={setStrOpenUrl}/>}></Route>
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
                  <Main                strOpenUrl={strOpenUrl} openTabs={openTabs} />
                  <UserInfo            strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <FormReg             strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <Menu                strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <UserForm            strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <Environmental       strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <FileTest            strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <SearchBoxReg        strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <CompanyReg          strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <Scope3              strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <Scope1to2           strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <GeneralWaste        strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <DesignatedWaste     strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <ConstructionWaste   strOpenUrl={strOpenUrl} openTabs={openTabs}/> 
                  <TableReg            strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <BizUnitForm         strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <TotalWaste          strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <DirectEmployment    strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <InDirectEmployment  strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <AgeEmployment       strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <CountryEmployment   strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <RegionEmployment    strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <PositionEmployment  strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <JobEmployment       strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <DonationAmount      strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <VolunteerEmployment strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <CountryReg          strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <WorkYear            strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <WonderWoman         strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <SocialWeakness      strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <HiredEmployment     strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <RetiredEmployment   strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <UserGroupReg        strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <UserGroupForm       strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <GameRecordReg       strOpenUrl={strOpenUrl} openTabs={openTabs} jumpRowData={jumpRowData} setJumpRowData={setJumpRowData}/>
                  <TeamReg             strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <PlayerInfoReg       strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <PlayerInfoQuery     strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <PlayerStatsQuery    strOpenUrl={strOpenUrl} openTabs={openTabs}/>
                  <GameRecordSummary   strOpenUrl={strOpenUrl} setStrOpenUrl={setStrOpenUrl} openTabs={openTabs} setJumpRowData={setJumpRowData}/>
                  <AlarmList           strOpenUrl={strOpenUrl} openTabs={openTabs} setOpenUrl={setStrOpenUrl}/>
                </DataContainer>
            </Container>
            </MenuInfoProvider>
          </>
        }
    </div>
  );  
}

export default App;
