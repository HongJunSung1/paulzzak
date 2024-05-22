import {Container, DataContainer} from "./App.styles.tsx";
import { Routes, Route } from 'react-router-dom'

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';

// 화면 영역
import Login from './ESG-login/p-esg-login.tsx';
import Main from './ESG-form/main/p-esg-form-main.tsx';
import Environmental from './ESG-form/test/p-esg-form-test.tsx';

function App() {

  return (      
  <div className="App" style={{backgroundColor:"#faf9f8"}}>
    <Navbar />
    <Container>
      <SideBar />
      <DataContainer>
        <Routes>
          <Route path="/" exact element={<Login/>}></Route>
          {/* 실제 데이터 작성 구간 */}
            <Route path="/main" element={<Main/>}></Route>
            <Route path="/environmental" element={<Environmental/>}></Route>
          {/* 실제 데이터 작성 구간 */}
        </Routes>
      </DataContainer>
    </Container>
  </div>
  );  
}

export default App;
