// 경기기록조회
import React, { useMemo, useEffect, useRef, useState }  from 'react'

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from '../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx';
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import DatePick from '../../ESG-common/DatePicker/p-esg-common-datePicker.tsx'
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

//점프
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    DateFr   : string;
    DateTo   : string;
    SeasonCD : number;
    DataSet  : string;
}

// 메시지 박스
let message : any    = [];
let title   : string = "";


type FormGameRecordSummaryProps = {
  strOpenUrl: any;
  setStrOpenUrl: any;
  openTabs: any;
  setJumpRowData: any;
};

const GameRecordSummary = ({ strOpenUrl, setStrOpenUrl, openTabs, setJumpRowData }: FormGameRecordSummaryProps) => {
    
    //점프
    const { setMenuInfo } = useMenuInfo();
    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [DateFr  , setDateFr]   = useState('');
    const [DateTo  , setDateTo]   = useState('');
    const [SeasonCD, setSeasonCD] = useState(0);

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
      , {id: 1, title:"조회", image:"query", spName:"S_PZ_Stat_GameRecordSummary_Query"}
    //   , {id: 2, title:"삭제", image:"cut"  , spName:""}
      , {id: 3, title:"경기기록등록", image:"jump"  , spName:""}
    ]

    // 헤더 정보
    const headerOptions = useMemo(() => {
        const complexColumns : any[] =[
            {
                header: '승/패',
                name: 'mergeColumn1',
                childNames: ['TeamAResult', 'TeamBResult']
            },
            {
                header: '점수',
                name: 'mergeColumn2',
                childNames: ['TeamAScore', 'TeamBScore']
            },
            {
                header: '2점',
                name: 'mergeColumn3',
                childNames: ['TeamA2P', 'TeamB2P']
            },
            {
                header: '3점',
                name: 'mergeColumn4',
                childNames: ['TeamA3P', 'TeamB3P']
            },
            {
                header: '자유투',
                name: 'mergeColumn5',
                childNames: ['TeamAFT', 'TeamBFT']
            },
            {
                header: '리바운드',
                name: 'mergeColumn6',
                childNames: ['TeamARebound', 'TeamBRebound']
            },
            {
                header: '어시스트',
                name: 'mergeColumn7',
                childNames: ['TeamAAssist', 'TeamBAssist']
            },
            {
                header: '스틸',
                name: 'mergeColumn8',
                childNames: ['TeamASteal', 'TeamBSteal']
            },
            {
                header: '블로킹',
                name: 'mergeColumn9',
                childNames: ['TeamABlock', 'TeamBBlock']
            },
            {
                header: '턴오버',
                name: 'mergeColumn10',
                childNames: ['TeamATurnOver', 'TeamBTurnOver']
            },
            {
                header: '파울',
                name: 'mergeColumn11',
                childNames: ['TeamAFoul', 'TeamBFoul']
            },
        ]
        return{
            height: 60,
            complexColumns: complexColumns.length > 0 ? complexColumns : undefined
        };
    }, []);


    
     // 시트 컬럼 값
     const columns1 = useMemo(() => ([
        {name : "GameCD"            , header: "내부코드"   , width:  70, hidden: true},
        {name : "SeasonCD"          , header: "시즌코드"   , width:  70, hidden: true},
        {name : "GameDate"          , header: "경기날짜"   , width: 168, renderer: {type: "datebox", options:{dateType:"day"}}},
        {name : "TeamACD"           , header: "A팀코드"    , width:  70, hidden: true},
        {name : "TeamAName"         , header: "A팀"        , width:  80, disabled:false},
        {name : "TeamBCD"           , header: "B팀코드"    , width:  70, hidden: true},
        {name : "TeamBName"         , header: "B팀"        , width:  80, disabled:false},
        {name : "TeamAResult"       , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBResult"       , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamAScore"        , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBScore"        , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamA2P"           , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamB2P"           , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamA3P"           , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamB3P"           , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamAFT"           , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBFT"           , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamARebound"      , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBRebound"      , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamAAssist"       , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBAssist"       , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamASteal"        , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBSteal"        , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamABlock"        , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBBlock"        , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamATurnOver"     , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBTurnOver"     , header: "B팀"        , width:  50, disabled:false},
        {name : "TeamAFoul"         , header: "A팀"        , width:  50, disabled:false},
        {name : "TeamBFoul"         , header: "B팀"        , width:  50, disabled:false},
    ]), []);

    // 툴바 이벤트
    const toolbarEvent = async (clickID : any) =>{
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
                        DateFr    : DateFr,
                        DateTo    : DateTo,
                        SeasonCD  : SeasonCD,
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
                
            // 삭제
            case 2 :
                    setLoading(true);
                    // 체크한 데이터 담기 
                    let checkedData : any[] = [];

                    checkedData.push(grid1Ref.current.getCheckedRows());

                    // 삭제할 데이터 없을시 종료
                    if(checkedData[0].grid.length === 0){
                        message  = [];
                        message.push({text: "삭제할 데이터가 없습니다."})
                        setMessageOpen(true);
                        title   = "삭제 오류";
                        setLoading(false);
                        return;
                    }

                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            grid1Ref.current.removeRows(result[0]);
                            let errMsg : any[] = [];
                            errMsg.push({text: "삭제 완료하였습니다."})
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "삭제 완료";
                        } else{
                            // SP 결과 값이 없을 때 로직
                            let errMsg : any[] = [];
                            errMsg.push({text: "삭제할 데이터가 없습니다."})
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "삭제 실패";
                        }
                    } catch (error) {
                        // SP 호출 시 에러 처리
                        console.log(error);
                    }
                    setLoading(false);

            break;

            // 점프
            case 3:
                // 체크한 데이터 담기 
                let checkedJumpData : any[] = [];
                checkedJumpData.push(grid1Ref.current.getCheckedRows());

                if(checkedJumpData[0].grid.length === 0){
                    message  = [];
                    message.push({text: "이동할 데이터가 없습니다."});
                    setMessageOpen(true);
                    title   = "점프 오류";
                    return;
                } else if(checkedJumpData[0].grid.length > 1){
                    message  = [];
                    message.push({text: "한 개의 데이터만 이동 가능합니다."});
                    setMessageOpen(true);
                    title   = "점프 오류";
                    return;
                }

                const jumpRow = checkedJumpData;
                setJumpRowData(jumpRow);

                const jumpTab = {
                    id: "23",
                    menuName: "경기기록등록",
                    url: "PPzStatsGameRecordReg"
                };

                setMenuInfo(jumpTab); // 탭이동
                setStrOpenUrl("/PPzStatsGameRecordReg"); //화면 전환
                break;
        }
    }
    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {
        ;
    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find((item: any) => item.url === '/PPzStatsGameRecordSummary') === undefined) {
            setDateFr('');
            setDateTo('');
            setGrid1Data([]);
        }
    }, [openTabs]);

    return (
        <>
            <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PPzStatsGameRecordSummary' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"조회 조건"}>
                    <FixedWrap>
                        <span style= {{marginTop:"3px", marginRight: "15px", zIndex:"99"}}>
                            <DatePick name={"시작일"}   value={DateFr}  onChange={setDateFr} width={200} type={"day"} isGrid={false}/>    
                        </span>
                        <span style= {{marginTop:"3px", marginRight: "10px", zIndex:"99"}}>
                            <DatePick name={"종료일"}   value={DateTo}   onChange={setDateTo} width={200} type={"day"} isGrid={false}/>    
                        </span>
                        <SearchBox name={"시즌명"}  value={SeasonCD} isRequire={"false"} onChange={(val: any) => setSeasonCD(val.code)} width={200} searchCode={6} isGrid={false}/>
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "경기 정보" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                </DynamicArea>
            </div>
        </>
    )
}

export default GameRecordSummary;