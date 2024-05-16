import {Container, DataContainer} from "./App.styles.tsx";

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';


function App() {
  return (
    <div className="App" style={{backgroundColor:"#faf9f8"}}>
      <Navbar />
      <Container>
        <SideBar />
        {/* 실제 데이터 작성 구간 */}
        <DataContainer>
          실제 데이터 작성 구간
        </DataContainer>
      </Container>
    </div>
  );  
}

export default App;
