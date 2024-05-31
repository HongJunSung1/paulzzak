// 계정 관리

import React, { useRef, useState }  from 'react'
import '../../global.d.ts';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    FormName   : string;
    FormUrl    : string;
    DataSet    : string;
}  


const FormReg = () => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 조회조건 값
    const [FormName, setCondition1] = useState('')
    const [FormUrl  , setCondition2] = useState('')

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            grid1Changes = changes;
        } 
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:""}
      , {id: 2, title:"저장", image:"save" , spName:""}
      , {id: 3, title:"삭제", image:"cut"  , spName:""}
     ]

     // 시트 컬럼 값
     const columns1 = [
        {name : "FormCD"    , header: "화면코드", width:  70, hidden: true},
        {name : "FormName"  , header: "화면명"  , width: 300, editor: 'text'},
        {name : "FormUrl"   , header: "화면URL" , width: 300, editor: 'text'}
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                console.log("시트 초기화");
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        FormName : FormName,
                        FormUrl  : FormUrl,
                        DataSet  : 'DataSet1'
                    })

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                        } else{
                            // 결과값이 없을 경우 처리 로직
                            window.alert("조회 결과가 없습니다.")
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
                
                
                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        console.log(result);
                        window.alert("저장 완료되었습니다.")
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

                    setLoading(true);
                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            console.log(result);
                            window.alert("삭제 완료")
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

    return (
        <>
            <Loading loading={loading}/>
            <Toolbar items={toolbar} clickID={toolbarEvent}/>
            <FixedArea name={"조회 조건"}>
                <FixedWrap>
                    <TextBox name={"화면명"}  value={FormName} onChange={setCondition1} width={300}/>    
                    <TextBox name={"화면 URL"} value={FormUrl}   onChange={setCondition2} width={300}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Grid ref={grid1Ref} gridId="DataSet1" title = "화면 정보" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
            </DynamicArea>
        </>
    )
}

export default FormReg;