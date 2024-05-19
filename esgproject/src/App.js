import {Container, DataContainer} from "./App.styles.tsx";

// 공통 영역
import SideBar from './ESG-common/SideBar/p-esg-common-SideBar.tsx';
import Navbar from './ESG-common/NavBar/p-esg-common-NavBar.tsx';
import FixedArea from "./ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import DynamicArea from "./ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "./ESG-common/Splitter/p-esg-common-Splitter.tsx";


function App() {
  return (
    <div className="App" style={{backgroundColor:"#faf9f8"}}>
      <Navbar />
      <Container>
        <SideBar />
        <DataContainer>
          {/* 실제 데이터 작성 구간 */}
          <FixedArea name={"테스트 이름"}></FixedArea>  
          <DynamicArea>
            <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
              <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                <div>테스트1</div>
                <div>테스트2</div>
              </Splitter>
              <div>테스트 3</div>
            </Splitter>
          </DynamicArea>
          {/* 실제 데이터 작성 구간 */}
        </DataContainer>
      </Container>
    </div>
  );  
}

export default App;
