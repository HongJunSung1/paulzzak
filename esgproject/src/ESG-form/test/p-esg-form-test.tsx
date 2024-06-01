import React, { useRef, useState }  from 'react'
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


type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    condition1 : string;
    condition2 : string;
    condition3 : string;
    DataSet    : string;
}  

const Environmental: React.FC = () => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 조회조건 값
    const [condition1, setCondition1] = useState('')
    const [condition2, setCondition2] = useState('')
    const [condition3, setCondition3] = useState('')

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'grid1') {
            grid1Changes = changes;
        } else if (gridId === 'grid2') {
            grid2Changes = changes;
        }
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);
    

    const toolbar = [  
                       {id: 0, title:"신규", image:"new"  , spName:""}
                     , {id: 1, title:"조회", image:"query", spName:"S_Test"}
                     , {id: 2, title:"저장", image:"save" , spName:"S_Save_Test"}
                     , {id: 3, title:"삭제", image:"cut"  , spName:"S_Cut_Test"}
                    ]
    
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

        switch (clickID){

            // 신규
            case 0 :
                console.log("시트 초기화");
                break;

            // 저장
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        condition1 : condition1,
                        condition2 : condition2,
                        condition3 : condition3,
                        DataSet    : 'DataSet1'
                    })

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                            setGrid2Data(result[1]);
                        } else{
                            // 결과값이 없을 경우 처리 로직
                            window.alert("ㄴ")
                        }
                    } catch (error) {
                        // SP 호출 시 에러 처리 로직
                        console.log(error);
                    }
                    // 로딩뷰 감추기
                    setLoading(false);


                break;
            
            // 저장
            case 2 : 
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                combinedData.push(grid1Changes)
                combinedData.push(grid2Changes)

                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        console.log(result);
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        window.alert("저장 실패")
                    }
                } catch (error) {
                    // SP 호출 시 에러 처리
                    console.log(error);
                }
                setLoading(false);

                break;

            // 삭제
            case 3 :
                    // 체크한 데이터 담기 
                    let checkedData : any[] = [];

                    checkedData.push(grid1Ref.current.getCheckedRows());
                    checkedData.push(grid2Ref.current.getCheckedRows());

                    console.log(checkedData);

                    setLoading(true);
                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            console.log(result);
                        } else{
                            // SP 결과 값이 없을 때 로직
                            window.alert("저장 실패")
                        }
                    } catch (error) {
                        // SP 호출 시 에러 처리
                        console.log(error);
                    }
                    setLoading(false);

                break;
        }
      
    }

    // 화면
    return(
        <>
            <Loading loading={loading}/>
            <Toolbar items={toolbar} clickID={toolbarEvent}/>
            <FixedArea name={"테스트 이름"}>
                <FixedWrap>
                    <TextBox name={"신은규"} isRequire={"true"} value={condition1} onChange={setCondition1}/>   
                    <TextBox name={"엉덩이"} value={condition2} onChange={setCondition2}/>    
                    <TextBox name={"쥐어 뜯을 거"} width={300} value={condition3} onChange={setCondition3}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                    <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                        <div>
                            테스트 1
                        </div>
                        <Grid ref={grid1Ref} gridId="grid1" title = "제목" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
                    </Splitter>
                    <Grid ref={grid2Ref}  gridId="grid2" title = "제목 테스트" source = {grid2Data} columns = {columns2} onChange={handleGridChange} addRowBtn = {true}/>
                </Splitter>
            </DynamicArea>
        </>
    )

}

export default Environmental;