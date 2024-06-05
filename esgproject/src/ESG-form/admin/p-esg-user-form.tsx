import React, { useRef, useState }  from 'react'

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    FormName   : string;
    UserName   : string;
    DataSet    : string;
}  


const UserForm = () => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 조회조건 값
    const [UserName , setCondition1] = useState('');
    const [FormName , setCondition2] = useState('');

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            grid1Changes = changes;
        }else if(gridId === 'DataSet2'){
            grid2Changes = changes;
        }
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_User_Form_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_User_Form_Save"}
     ]

     // 시트 컬럼 값
     const columns1 = [
        {name : "UserCD"    , header: "사용자코드"     , width:  70 , hidden: true},
        {name : "UserName"  , header: "사용자명"       , width: 200, disabled:true},
        {name : "UserID"    , header: "사용자 아이디"  , width: 200, disabled:true},
    ];

    const columns2 = [
        {name : "FormCD"    , header: "화면 코드"     , width:  70, hidden: true},
        {name : "IsAuth"    , header: "권한여부"      , width: 70, editor: 'checkbox', renderer: { type: 'checkbox' }},
        {name : "FormName"  , header: "화면명"       , width: 400, disabled:true}
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                grid1Ref.current.clear();
                grid2Ref.current.clear();
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        FormName : FormName,
                        UserName : UserName,
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
                            setGrid2Data(result[1]);
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
                setLoading(true); 
                //시트 입력 종료
                grid1Ref.current.setEditFinish();
                grid2Ref.current.setEditFinish();

                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                grid2Changes.grid = grid2Ref.current.setColumCheck(grid2Changes.grid);
                
                combinedData.push(grid1Changes);
                combinedData.push(grid2Changes);

                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length === 0){
                    window.alert('저장할 데이터가 없습니다.');
                    setLoading(false);
                    return;
                }

                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        grid1Ref.current.setRowData(result[0]);
                        window.alert("저장 완료")
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        window.alert("저장 에러")
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
                    <SearchBox name={"사용자명"} value={UserName}  onChange={setCondition1} width={200} searchCode={1}/>
                    <TextBox   name={"화면명"}   value={FormName}  onChange={setCondition2} width={200}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Splitter SplitType={"horizontal"} FirstSize={40} SecondSize={60}>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "사용자 정보" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {false}/>
                    <Grid ref={grid2Ref} gridId="DataSet2" title = "화면 정보"   source = {grid2Data} columns = {columns2} onChange={handleGridChange} addRowBtn = {true}/>
                </Splitter>
            </DynamicArea>
        </>
    )
}

export default UserForm;