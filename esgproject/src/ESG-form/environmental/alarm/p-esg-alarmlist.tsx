//알림 내역 조회

import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../../hooks/sp-request.tsx';
import { useMenuInfo } from '../../../hooks/use-menu-info.tsx';


type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {  
    formName        : string;
    DataSet         : string;
}  


// 메시지 박스
let message : any     = [];
let title   : string  = "";


const AlarmList = ({strOpenUrl, openTabs, setOpenUrl}) => {

    // 탭 추가
    const { setMenuInfo } = useMenuInfo();

    const sessionStr = sessionStorage.getItem('menuList');
    let data : any;
    if(sessionStr) {
        data = JSON.parse(sessionStr);
    }

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [formName , setCondition1] = useState('');

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);


    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {

    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_AlarmList_Query"}
     ]

    // 헤더 정보
    const complexColumns =[]

    const headerOptions = {
        height: 60,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

    const clickGrid = (rowkey : number,colName : string) =>{
        
        const linkData = grid1Ref.current.getRowData(rowkey);

        //화면 이동
        setOpenUrl(linkData.FormUrl);

        // 탭 추가
        const filterData = data.filter((item => item.menuId === linkData.FormUrl.replace('/','')));
        setMenuInfo(filterData[0]);
    }


     // 시트 컬럼 값
     const columns1 = [ 
        {name : "FormUrl"       , header: "화면url"             , width: 100 ,hidden : true},
        {name : "LMenuName"     , header: "대메뉴"              , width: 200 },
        {name : "FormName"      , header: "화면명"              , width: 200 },
        {name : "CfmLev"        , header: "승인 차수"           , width: 80 },
        {name : "ReqUserName"   , header: "알림 전송자"         , width: 120 },
        {name : "ReqDateTime"   , header: "알림 전송일시"       , width: 150 },
        {name : "InfoCol3Width" , header: "화면 이동"           , width: 80 , renderer : {type: 'button', options: {btnName: "이 동", clickFunc : (rowkey,colName) => clickGrid(rowkey,colName)}}},
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
                        formName : formName,
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
                            message  = [];
                            message.push({text: "조회 결과가 없습니다."})
                            setMessageOpen(true);
                            title   = "조회 오류";
                            setGrid1Data([]);
                        }
                    } catch (error) {
                        // SP 호출 시 에러 처리 로직
                        console.log(error);
                    }
                    // 로딩뷰 감추기
                    setLoading(false);


                break;
        }
      
    }

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {

    }


    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgAlarmList') === undefined) {
            setCondition1('');
            setGrid1Data([]);
        }
    }, [openTabs]);

    return (
        <>
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgAlarmList' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"조회 조건"}>
                    <FixedWrap>
                        <TextBox   name={"화면명"}   value={formName}  onChange={setCondition1} width={200}/>    
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "알림 내역" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                </DynamicArea>
            </div>
        </>
    )
}

export default AlarmList;