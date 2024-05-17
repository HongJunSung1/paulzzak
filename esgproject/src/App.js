import {Container, DataContainer} from "./App.styles.tsx";

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';
import FixedArea from "./ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import DynamicArea from "./ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";


function App() {
  return (
    <div className="App" style={{backgroundColor:"#faf9f8"}}>
      <Navbar />
      <Container>
        <SideBar />
        {/* 실제 데이터 작성 구간 */}
        <DataContainer>
          <FixedArea name={"테스트 이름"}></FixedArea>  {/*임시로 테스트 하기 위해 App.js에 등록 화면 개발시 화면에 추가 */}  
          <DynamicArea></DynamicArea>{/*임시로 테스트 하기 위해 App.js에 등록 화면 개발시 화면에 추가   */}
        </DataContainer>
      </Container>
    </div>
  );  
}

export default App;
