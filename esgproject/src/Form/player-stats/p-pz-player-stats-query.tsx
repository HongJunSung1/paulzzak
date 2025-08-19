//선수별 기록 조회
import React, { useEffect, useRef, useState }  from 'react'

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from '../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx';
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    SeasonCD : number;
    UserName : string;
    DataSet  : string;
}

// 메시지 박스
let message : any    = [];
let title   : string = "";

const PlayerStatsQuery = ({strOpenUrl, openTabs}) => {
    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [SeasonCD, setSeasonCD] = useState(0);
    const [UserName, setUserName] = useState('');

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
      , {id: 1, title:"조회", image:"query", spName:"S_PZ_Stats_PlayerStats_Query"}
     ]

    // 헤더 정보
    const complexColumns =[
        {
            header: '출전경기',
            name: 'GameAttend',
            childNames:['GameCount', 'GameRatio']
        },
        {
            header: '2점',
            name: 'TwoP',
            childNames:['TwoPSuccess', 'TwoPAttempt', 'TwoPRatio']
        },
        {
            header: '3점',
            name: 'ThreeP',
            childNames:['ThreePSuccess', 'ThreePAttempt', 'ThreePRatio']
        },        
        {
            header: '자유투',
            name: 'FT',
            childNames:['FTSuccess', 'FTAttempt', 'FTRatio']
        },        
        {
            header: '리바운드',
            name: 'Rebounds',
            childNames:['Rebound', 'AVGRebound']
        },
        {
            header: '어시스트',
            name: 'Assists',
            childNames:['Assist', 'AVGAssist']
        },
        {
            header: '스틸',
            name: 'Steals',
            childNames:['Steal', 'AVGSteal']
        },
        {
            header: '블로킹',
            name: 'Blocks',
            childNames:['Block', 'AVGBlock']
        },
        {
            header: '턴오버',
            name: 'TurnOvers',
            childNames:['TurnOver', 'AVGTurnOver']
        },
        {
            header: '파울',
            name: 'Fouls',
            childNames:['Foul', 'AVGFoul']
        }
    ]

    const headerOptions = {
        height: 60,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

     // 시트 컬럼 값
     const columns1 = [
        {name : "UserCD"        , header: "내부코드"    , width:  70, hidden: true},
        {name : "UserName"      , header: "이름"        , width:  60},
        // {name : "GameCount"     , header: "출전\n경기수", width:  40, renderer: {type: "number"}, sortable: true},
        {name : "GameCount"     , header: "출전\n경기수", width:  40, renderer: {type: "number"}},
        {name : "GameRatio"     , header: "참석율"      , width:  40, renderer: {type: "number"}},
        {name : "TotalScore"    , header: "전체\n득점"  , width:  40, renderer: {type: "number"}},
        {name : "TwoPSuccess"   , header: "득점"        , width:  40, renderer: {type: "number"}},
        {name : "TwoPAttempt"   , header: "시도"        , width:  40, renderer: {type: "number"}},
        {name : "TwoPRatio"     , header: "성공률"      , width:  40, renderer: {type: "number"}},
        {name : "ThreePSuccess" , header: "득점"        , width:  40, renderer: {type: "number"}},
        {name : "ThreePAttempt" , header: "시도"        , width:  40, renderer: {type: "number"}},
        {name : "ThreePRatio"   , header: "성공률"      , width:  40, renderer: {type: "number"}},
        {name : "FTSuccess"     , header: "득점"        , width:  40, renderer: {type: "number"}},
        {name : "FTAttempt"     , header: "시도"        , width:  40, renderer: {type: "number"}},
        {name : "FTRatio"       , header: "성공률"      , width:  40, renderer: {type: "number"}},
        {name : "Rebound"       , header: "개수"        , width:  60, renderer: {type: "number"}},
        {name : "AVGRebound"    , header: "평균"        , width:  60, renderer: {type: "number"}},
        {name : "Assist"        , header: "개수"        , width:  60, renderer: {type: "number"}},
        {name : "AVGAssist"     , header: "평균"        , width:  60, renderer: {type: "number"}},
        {name : "Steal"         , header: "개수"        , width:  60, renderer: {type: "number"}},
        {name : "AVGSteal"      , header: "평균"        , width:  60, renderer: {type: "number"}},
        {name : "Block"         , header: "개수"        , width:  60, renderer: {type: "number"}},
        {name : "AVGBlock"      , header: "평균"        , width:  60, renderer: {type: "number"}},
        {name : "TurnOver"      , header: "개수"        , width:  60, renderer: {type: "number"}},
        {name : "AVGTurnOver"   , header: "평균"        , width:  60, renderer: {type: "number"}},
        {name : "Foul"          , header: "개수"        , width:  60, renderer: {type: "number"}},
        {name : "AVGFoul"       , header: "평균"        , width:  60, renderer: {type: "number"}},
     ]  
     
    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
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
                    SeasonCD : SeasonCD,
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
        if (openTabs.find(item => item.url === '/PPzPlayerStatsQuery') === undefined) {
            setSeasonCD(0);
            setUserName('');
            setGrid1Data([]);
        }
    }, [openTabs]);

    return (
        <>
            <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PPzPlayerStatsQuery' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"조회 조건"}>
                    <FixedWrap>
                        <SearchBox name={"시즌명"}  value={SeasonCD} isRequire={"false"} onChange={(val) => setSeasonCD(val.code)} width={200} searchCode={6} isGrid={false}/>
                        <TextBox   name={"회원명"}  value={UserName} onChange={setUserName} width={200}/>    
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "선수별 정보" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                </DynamicArea>
            </div>
        </>
    )
}

export default PlayerStatsQuery;