// 서치박스

import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {  
    searchBoxName   : string;
    DataSet         : string;
}  


// 메시지 박스
let message : any     = [];
let title   : string  = "";


const SearchBoxReg = ({strOpenUrl, openTabs, setIsDataChanged}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [searchBoxName , setCondition1] = useState('');

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        setIsDataChanged(true);
        // if(gridId === 'DataSet1'){
        //     grid1Changes = changes;
        // }
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_SearchBox_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_SearchBox_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_SearchBox_Cut"}
     ]

     // 시트 컬럼 값
     const columns1 = [
        {name : "SearchBoxCD"   , header: "서치박스 코드"       , width: 100 },
        {name : "SearchBoxName" , header: "서치박스명"          , width: 200 , editor: 'text' , validation : [{require : true }]},
        {name : "TableName"     , header: "테이블명"            , width: 200 , editor: 'text'},
        {name : "ColumnName"    , header: "메인 컬럼명"         , width: 100 , editor: 'text'},
        {name : "CodeColName"   , header: "메인 컬럼 코드"      , width: 110 , editor: 'text'},
        {name : "ColumnWidth"   , header: "메인 컬럼 넓이"      , width: 100 , editor: 'text'},
        {name : "InfoCol1NameKr", header: "컬럼명1"             , width: 120 , editor: 'text'},
        {name : "InfoCol1"      , header: "컬럼코드1"           , width: 120 , editor: 'text'},
        {name : "InfoCol1Width" , header: "컬럼 1 넓이"         , width: 120 , editor: 'text'},
        {name : "InfoCol2NameKr", header: "컬럼명 2"            , width: 120 , editor: 'text'},
        {name : "InfoCol2"      , header: "컬럼코드 2"          , width: 120 , editor: 'text'},
        {name : "InfoCol2Width" , header: "컬럼 2 넓이"         , width: 120 , editor: 'text'},
        {name : "InfoCol3NameKr", header: "컬럼명 3"            , width: 120 , editor: 'text'},
        {name : "InfoCol3"      , header: "컬럼코드 3"          , width: 120 , editor: 'text'},
        {name : "InfoCol3Width" , header: "컬럼 3 넓이"         , width: 120 , editor: 'text'},
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                setGrid1Data([]);
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        searchBoxName : searchBoxName,
                        DataSet  : 'DataSet1'
                    })

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result[0].length > 0){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                        }else{
                            // 결과값이 없을 경우 처리 로직
                            window.alert("조회 결과가 없습니다.");
                            setGrid1Data([]);
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

                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //그리드 변동 내역 가져오기
                grid1Changes = grid1Ref.current.getModifiedData();

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                

                combinedData.push(grid1Changes);

                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length === 0){
                    window.alert('저장할 데이터가 없습니다.');
                    setLoading(false);
                    return;
                }

                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        let errMsg : any[] = [];
                        // SP 호출 결과 값 처리
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    errMsg.push({text: "시트: 서치박스 정보 " + result[i][j].Message})
                                }
                            }
                        }
                        if(errMsg.length > 0){
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "저장 에러";
                            setLoading(false);
                            return;
                        }   
                        grid1Ref.current.setRowData(result[0]);
                        const gridAllData = grid1Ref.current.getAllData();
                        setGrid1Data(gridAllData);
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


            // 삭제
            case 3 :
                    setLoading(true);

                    // 체크한 데이터 담기 
                    let checkedData : any[] = [];

                    checkedData.push(grid1Ref.current.getCheckedRows());

                    // 삭제할 데이터 없을시 종료
                    if(checkedData[0].grid.length === 0){
                        window.alert('삭제할 데이터가 없습니다.');
                        setLoading(false);
                        return;
                    }

                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            grid1Ref.current.removeRows(result[0]);
                            const gridAllData = grid1Ref.current.getAllData();
                            setGrid1Data(gridAllData);
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


    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgFormAdminSearchBox') === undefined) {
            setCondition1('');
            setGrid1Data([]);
        }
    }, [openTabs]);

    if(strOpenUrl === '/PEsgFormAdminSearchBox')
    return (
        <>
            <Loading loading={loading}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <Toolbar items={toolbar} clickID={toolbarEvent}/>
            <FixedArea name={"조회 조건"}>
                <FixedWrap>
                    <TextBox   name={"서치박스명"}   value={searchBoxName}  onChange={setCondition1} width={200}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Grid ref={grid1Ref} gridId="DataSet1" title = "서치박스 정보" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
            </DynamicArea>
        </>
    )
}

export default SearchBoxReg;