import React, { useEffect, useState }  from 'react'
import '../../global.d.ts';


//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';

type ModifiedRows = {
    createdRows: any[];
    updatedRows: any[];
    deletedRows: any[];
    DataSet    : string;
  };

  
const Environmental: React.FC = () => {


    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);
    let [grid1Changes] = useState<ModifiedRows>({ createdRows: [], updatedRows: [], deletedRows: [] , DataSet : ""});
    let [grid2Changes] = useState<ModifiedRows>({ createdRows: [], updatedRows: [], deletedRows: [] , DataSet : ""});
  

    const handleGridChange = (gridId: string, changes: ModifiedRows) => {
        if (gridId === 'grid1') {
            grid1Changes = changes;
        } else if (gridId === 'grid2') {
            grid2Changes = changes;
        }
      };
    
    const handleSave = () => {
        const combinedData = {
          grid1: grid1Changes,
          grid2: grid2Changes,
        };
    
        console.log('Combined Data:', combinedData);
    
        // 여기서 API 호출이나 데이터 처리를 수행합니다.
    };



    const toolbar = [  
                       {id: 0, title:"신규", image:"new"  , spName:""}
                     , {id: 1, title:"조회", image:"query", spName:"S_Test"}
                     , {id: 2, title:"저장", image:"save" , spName:"S_Save_Test"}
                     , {id: 3, title:"삭제", image:"cut"  , spName:""}
                    ]

    const [loading,setLoading] = useState(false);
    
    const columns1 = [
        {name : "id", header: "ID", width: 50},
        {name : "name", header: "Name", width: 100, editor: 'text'},
    ];

    const columns2 = [
        {name : "id", header: "ID", width: 50, editor: 'text', validation: {dataType: 'number'}},
        {name : "NickName", header: "NickName", width: 100, editor: 'text', align: 'center'},
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        const combinedData = {
            grid1: grid1Changes,
            grid2: grid2Changes,
        };

        switch (clickID){

            case 0 :
                console.log("시트 초기화");
                break;

            case 1 : 

                    setLoading(true);
                    try {
                        const result = await SP_Request(toolbar[clickID].spName, [{id : 1, name: '신은규' },{id : 2, name : '홍준성'}]);
                        setGrid1Data(result[0]);
                        setGrid2Data(result[1]);
                    } catch (error) {
                        console.log(error);
                    }
                    setLoading(false);


                break;

            case 2 : 

                break;

            case 3 : 

                break;
        }
      
    }

    // 소스 결과 값 전달
    // const resData = (resData) => {
    //     // for(let i = 0; i < Object.keys(resData[0]).length; i++){
    //     //     resData[0][i].DataSet = 'DataSet1';
    //     // }
        
    //     // for(let i = 0; i < Object.keys(resData[1]).length; i++){
    //     //     resData[1][i].DataSet = 'DataSet2';
    //     // }

    //     setGrid1Data(grid1Data);
    //     setGrid2Data(grid2Data);
    // };



    return(
        <>
            <Loading loading={loading}/>
            <Toolbar items={toolbar} clickID={toolbarEvent}/>
            <FixedArea name={"테스트 이름"}>
                <FixedWrap>
                    <TextBox name={"신은규"} isRequire={"true"}/>   
                    <TextBox name={"엉덩이"}/>    
                    <TextBox name={"쥐어 뜯을 거"} width={300}/>    
                </FixedWrap>
                <FixedWrap>
                    <TextBox></TextBox>    
                    <TextBox></TextBox>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
            <button onClick={handleSave}>Save All Changes</button>
                <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                    <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                        <div>
                            테스트 1
                        </div>
                        {/* <Grid  title = "제목" source = {source1} columns = {columns1} onChange={handleGridChange}/> */}
                        <Grid gridId="grid1" title = "제목" source = {grid1Data} columns = {columns1} onChange={handleGridChange} DataSet="DataSet1"/>
                    </Splitter>
                    {/* <Grid title = "제목 테스트" source = {source2} columns = {columns2} onChange={handleGridChange}/> */}
                    <Grid gridId="grid2" title = "제목 테스트" source = {grid2Data} columns = {columns2} onChange={handleGridChange} DataSet="DataSet2"/>
                    
                </Splitter>
            </DynamicArea>
        </>
    )

}

export default Environmental;