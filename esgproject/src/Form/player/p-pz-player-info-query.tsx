// 선수정보조회

import React, { useMemo, useEffect, useRef, useState }  from 'react'


//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from '../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx';
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
    UserName   : string;
    DataSet    : string;
}  

// 메시지 박스
let message : any    = [];
let title   : string = "";

type FormPlayerInfoQueryProps = {
  strOpenUrl: any;
  openTabs: any;
};

const PlayerInfoQuery = ({strOpenUrl, openTabs}: FormPlayerInfoQueryProps) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};
    
    // 조회조건 값
    const [UserName, setCondition1] = useState('');
    const [Position, setCondition2] = useState('');

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            setGrid1Changes(changes);
        } 
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_PZ_Stats_PlayerInfo_Query"}
     ]


    // 헤더 정보
    
    const headerOptions = useMemo(() => {
        const complexColumns : any[] =[];
        return{
            height: 60,
            complexColumns: complexColumns.length > 0 ? complexColumns : undefined
        }
    }, []);

     // 시트 컬럼 값
     const columns1 = useMemo(() => ([
        {name : "UserCD"            , header: "유저코드"    , width:  70, hidden: true},
        {name : "UserDetailCD"      , header: "유저상세코드", width:  70, hidden: true},
        {name : "UserName"          , header: "회원명"      , width: 150, disabled:false},
        {name : "BackNumber"        , header: "등번호"      , width: 80 , disabled:false},
        // {name : "PositionFirstCD"   , header: "포지션1코드" , width: 70 , disabled:true, hidden: true},
        // {name : "PositionFirstName" , header: "포지션1"     , width: 150, renderer : {type: 'searchbox', options: {searchCode: 8, CodeColName: "PositionFirstCD"}}},
        // {name : "PositionSecondCD"  , header: "포지션2코드" , width: 70 , disabled:true, hidden: true},
        // {name : "PositionSecondName", header: "포지션2"     , width: 150, renderer : {type: 'searchbox', options: {searchCode: 8, CodeColName: "PositionSecondCD"}}},
        {name : "RegDateTime"       , header: "등록일"      , width: 168, renderer:  {type: "datebox", options:{dateType:"day"}}},
        {name : "IsGuest"           , header: "게스트여부"  , width: 70 , renderer:  {type: 'checkbox' }},
        {name : "IsSleep"           , header: "휴면회원"    , width: 70 , renderer:  {type: 'checkbox' }},
        {name : "IsOut"             , header: "탈퇴여부"    , width: 70 , renderer:  {type: 'checkbox' }},
    ]), []);

    // 툴바 이벤트
    const toolbarEvent = async (clickID: any) =>{
        switch (clickID){
            // 신규
            case 0 :
                grid1Ref.current.clear();
                setGrid1Data([]);
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        UserName  : UserName,
                        DataSet   : 'DataSet1'
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
                            message  = [];
                            message.push({text: "조회 결과가 없습니다."})
                            setMessageOpen(true);
                            title   = "조회 오류";
                            setLoading(false);
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
        ;
    }
    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find((item: any) => item.url === '/PPzPlayerInfoQuery') === undefined) {
            setCondition1('');
            setCondition2('');
            setGrid1Data([]);
            setGrid1Changes({DataSet : '', grid: []});
        }
    }, [openTabs]);

    return (
        <>
            <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PPzPlayerInfoQuery' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"조회 조건"}>
                    <FixedWrap>
                        <TextBox name={"회원명"}  value={UserName} onChange={setCondition1} width={300}/>    
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "회원 정보" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                </DynamicArea>
            </div>
        </>
    )
}

export default PlayerInfoQuery;