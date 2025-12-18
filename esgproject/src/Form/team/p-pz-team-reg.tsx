// 시즌 및 팀 등록
import React, { useMemo, useRef, useState, useEffect }  from 'react'
import '../../global.d.ts';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DatePick from '../../ESG-common/DatePicker/p-esg-common-datePicker.tsx'
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    DateFr       : string;
    DateTo       : string;
    DataSet      : string;
}  

// 우클릭 조회 시 받는 내부코드 값
let SeasonCD = 0
let TeamCD = 0

// 에러 메세지
let message : any     = [];
let title   : string  = "";

type FormTeamRegProps = {
  strOpenUrl: any;
  openTabs: any;
};

const TeamReg = ({strOpenUrl, openTabs}: FormTeamRegProps) =>{
    // 로딩뷰
    const [loading,setLoading] = useState(false);
    
    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [DateFr, setDateFr] = useState('');
    const [DateTo, setDateTo] = useState('');

    // 2시트 제목
    const [SeasonName, setSeasonName] = useState('');
    const [TeamName, setTeamName] = useState('');

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);
    const [grid3Data, setGrid3Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes, setGrid2Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid3Changes, setGrid3Changes] = useState<gridAr>({ DataSet : '', grid: []});


    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            setGrid1Changes(changes);
        } else if (gridId === 'DataSet2') {
            setGrid2Changes(changes);
        } else if (gridId === 'DataSet3') {
            setGrid3Changes(changes);
        }
    };

    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);    
    const grid3Ref : any = useRef(null);    

    // 우클릭 시 조회
    // 1. 대분류 우클릭 → 중분류 조회
    const rightClick1 = (event: React.MouseEvent) => {
        event.preventDefault();  // 기본 우클릭 메뉴 비활성화
        setTimeout(async ()=> {
            SeasonCD = 0
            grid2Ref.current.clear();

            if(grid1Ref.current.rightClick() !== null){
                SeasonCD = grid1Ref.current.rightClick().SeasonCD
                setSeasonName(grid1Ref.current.rightClick().SeasonName)
            }     

            if(SeasonCD > 0){
                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request("S_Team_Reg_Sub_Query", [{SeasonCD: SeasonCD, DataSet : 'DataSet1'}]);
                    if(result.length > 0){
                        setGrid2Data([]);
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        setGrid2Data(result[0]);
                    } else{
                        setGrid2Data([]);
                    }
                } catch (error) {
                    // SP 호출 시 에러 처리 로직
                    console.log(error);
                }
                // 로딩뷰 감추기
                setLoading(false);
            }
        }, 100)
    };

    // 2. 팀 우클릭 → 선수 조회
    const rightClick2 = (event: React.MouseEvent) => {
        event.preventDefault();  // 기본 우클릭 메뉴 비활성화
        setTimeout(async ()=> {
            TeamCD = 0
            grid3Ref.current.clear();

            if(grid2Ref.current.rightClick() !== null){
                TeamCD = grid2Ref.current.rightClick().TeamCD
                setTeamName(grid2Ref.current.rightClick().TeamName)
            }     

            if(TeamCD > 0){
                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request("S_Team_Reg_Sub_Sub_Query", [{TeamCD: TeamCD, DataSet : 'DataSet2'}]);
                    if(result.length > 0){
                        setGrid3Data([]);
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        setGrid3Data(result[0]);
                    } else{
                        setGrid3Data([]);
                    }
                } catch (error) {
                    // SP 호출 시 에러 처리 로직
                    console.log(error);
                }
                // 로딩뷰 감추기
                setLoading(false);
            }
        }, 100)
    };

    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_Team_Reg_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_Team_Reg_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_Team_Reg_Cut"}
     ]

    // 헤더 정보
    
    const headerOptions = useMemo(() => {
        const complexColumns: any[] = [];
        return{
            height: 60,
            complexColumns: complexColumns.length > 0 ? complexColumns : undefined
        };
    }, []);

    // 시트 컬럼 값
    const columns1 = useMemo(() => ([
        {name : "SeasonCD"  , header: "내부코드"   , width:  70, hidden: false },
        {name : "DateFr"    , header: "시작일자"   , width: 120, renderer: {type: "datebox", options:{dateType:"day"}}},
        {name : "DateTo"    , header: "종료일자"   , width: 120, renderer: {type: "datebox", options:{dateType:"day"}}},
        {name : "SeasonName", header: "시즌명"     , width: 120, editor: 'text'},
    ]), []);

    // 시트 컬럼 값
    const columns2 = useMemo(() => ([
        {name : "SeasonCD"  , header: "시즌코드"   , width:  70, hidden: false },
        {name : "TeamCD"    , header: "팀코드"     , width:  70, hidden: false },
        {name : "TeamName"  , header: "팀명"       , width: 250, editor: 'text'},
    ]), []);

    // 시트 컬럼 값
    const columns3 = useMemo(() => ([
        {name : "TeamCD"    , header: "팀코드"     , width:  70, hidden: false },
        {name : "UserCD"    , header: "사용자코드" , width:  70, hidden: false},
        {name : "BackNumber", header: "등번호"     , width:  20, renderer : {type: 'number'}},
        {name : "UserName"  , header: "선수명"     , width: 100, renderer : {type: 'searchbox', options: {searchCode: 9, CodeColName :"UserCD", InfoCol1: "BackNumber"}}},
    ]), []);

    // 툴바 이벤트
    const toolbarEvent = async (clickID: any) =>{
        switch(clickID){
            // 신규
            case 0:
                grid1Ref.current.clear();
                grid2Ref.current.clear();
                grid3Ref.current.clear();
                setGrid1Data([]);
                setGrid2Data([]);
                setGrid3Data([]);
                setSeasonName('');
                setTeamName('');
                SeasonCD = 0;
                TeamCD = 0;
                break;

            // 조회
            case 1: 
                grid2Ref.current.clear();
                // 조회 조건 담기
                const conditionAr : condition =({
                    DateFr  : DateFr,
                    DateTo  : DateTo,
                    DataSet : 'DataSet1'
                })
                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                    
                    if(result[0].length > 0){
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        // 조회 버튼으로는 대메뉴 조회만 나와야 하기 때문에 result[0]만 뿌려줌
                        setGrid1Data(result[0]);
                    } else{
                        // 결과값이 없을 경우 처리 로직
                        // 조회 결과 초기화
                        setGrid1Data([]);
                        setGrid2Data([]);

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

            // 저장
            case 2 : 
                //시트 수정 종료
                grid1Ref.current.setEditFinish();
                grid2Ref.current.setEditFinish();
                grid3Ref.current.setEditFinish();
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                grid2Changes.grid = grid2Ref.current.setColumCheck(grid2Changes.grid);
                grid3Changes.grid = grid3Ref.current.setColumCheck(grid3Changes.grid);

                // 중분류에 대분류 내부코드 넣기
                for(let i = 0; i < grid2Changes.grid.length; i++){
                    if(grid2Changes.grid[i].SeasonCD === null){
                        grid2Changes.grid[i].SeasonCD = SeasonCD
                    }
                }

                // 선수등록에 팀 내부코드 넣기
                for(let i = 0; i < grid3Changes.grid.length; i++){
                    if(grid3Changes.grid[i].TeamCD === null){
                        grid3Changes.grid[i].TeamCD = TeamCD
                    }
                }

                combinedData.push(grid1Changes)
                combinedData.push(grid2Changes)
                combinedData.push(grid3Changes)

                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length + combinedData[1].grid.length + combinedData[2].grid.length === 0){
                    message  = [];
                    message.push({text: "저장할 데이터가 없습니다."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    setLoading(false);
                    return;
                } 
                setLoading(true); 

                // 중분류 우클릭 조회 없이 저장하면 리턴
                if(grid2Changes.grid.length > 0 && SeasonCD === 0){
                    message  = [];
                    message.push({text: "시즌 우클릭 후 팀등록 메뉴 저장이 가능합니다."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    setLoading(false);
                    return;
                }

                // 소분류 우클릭 조회 없이 저장하면 리턴
                if(grid3Changes.grid.length > 0 && TeamCD === 0){
                    message  = [];
                    message.push({text: "팀등록 우클릭 후 선수등록 메뉴 저장이 가능합니다."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    setLoading(false);
                    return;
                }     

                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    let errMsg : any[] = [];
                    if(result){
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    if(i === '0'){
                                        errMsg.push({text: "[시트: 시즌등록] " + result[i][j].Message})
                                    }
                                    if( i === '1'){
                                        errMsg.push({text: "[시트: 팀등록] " + result[i][j].Message})
                                    }
                                    if( i === '2'){
                                        errMsg.push({text: "[시트: 선수등록] " + result[i][j].Message})
                                    }                                    
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
                        // SP 호출 결과 값 처리
                        grid1Ref.current.setRowData(result[0]);
                        grid2Ref.current.setRowData(result[1]);
                        grid3Ref.current.setRowData(result[2]);

                        //시트 변경 내역 초기화
                        setGrid1Changes({ DataSet : '', grid: []});
                        setGrid2Changes({ DataSet : '', grid: []});
                        setGrid3Changes({ DataSet : '', grid: []});

                        // SP 결과 값이 있을 때 로직
                        errMsg  = [];
                        errMsg.push({text: "저장 완료하였습니다."})
                        setMessageOpen(true);
                        message = errMsg;
                        title   = "저장 완료";
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        console.log("저장 에러");
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
                checkedData.push(grid3Ref.current.getCheckedRows());

                // 삭제할 데이터 없을시 종료
                if(checkedData[0].grid.length + checkedData[1].grid.length + checkedData[2].grid.length === 0){
                    message  = [];
                    message.push({text: "삭제할 데이터가 없습니다."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    setLoading(false);
                    return;
                }
                
                setLoading(true);
                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){

                            let errMsgDel : any[] = [];
                            // SP 호출 결과 값 처리
                            for(let i in result){
                                for(let j in result[i]){
                                    if(result[i][j].Status > 0){
                                        errMsgDel.push({text: result[i][j].Message})
                                    }
                                }
                            }
                            if(errMsgDel.length > 0){
                                setMessageOpen(true);
                                message = errMsgDel;
                                title   = "저장 에러";
                                setLoading(false);
                                return;
                            }   

                            // SP 결과 값이 있을 때 로직
                            grid1Ref.current.removeRows(result[0]);
                            grid2Ref.current.removeRows(result[1]);
                            grid3Ref.current.removeRows(result[2]);

                            // SP 결과 값이 있을 때 로직
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
        }
    
    }

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {
        const grid1Inst = grid1Ref.current.getInstance();
        const grid2Inst = grid2Ref.current.getInstance();
        const grid3Inst = grid3Ref.current.getInstance();

        if(ref === grid1Inst){
            grid2Ref.current.blur();
            grid3Ref.current.blur();
        }else if (ref === grid2Inst){
            grid1Ref.current.blur();
            grid3Ref.current.blur();
        }else if (ref === grid3Inst){
            grid1Ref.current.blur();
            grid2Ref.current.blur();
        }
    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find((item: any) => item.url === '/PPzTeamReg') === undefined) {
            setGrid1Data([]);
            setGrid2Data([]);
            setGrid3Data([]);
        }
    }, [openTabs]); 

    return (
        <>
            <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PPzTeamReg' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/> 
                <FixedArea name={"조회조건"}>
                    <FixedWrap>
                        <DatePick name={"시작일"}   value={DateFr}  onChange={setDateFr} width={200} type={"day"} isGrid={false}/>    
                        <span style= {{marginLeft: "15px", zIndex:"999"}}>
                            <DatePick name={"종료일"}   value={DateTo}  onChange={setDateTo} width={200} type={"day"} isGrid={false}/>    
                        </span>
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Splitter SplitType={"horizontal"} FirstSize={33} SecondSize={67}>
                        <div onContextMenu={rightClick1} style={{height:"100%"}}>
                            <Grid ref={grid1Ref} gridId="DataSet1" title = "시즌등록" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                        </div>
                        <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                            <div onContextMenu={rightClick2} style={{height:"100%"}}>
                                <Grid ref={grid2Ref} gridId="DataSet2" title = {SeasonName ? SeasonName : "팀등록"} source = {grid2Data} headerOptions={headerOptions} columns = {columns2} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                            </div>
                            <div style={{height:"100%"}}>
                                <Grid ref={grid3Ref} gridId="DataSet3" title = {TeamName ? TeamName : "선수등록"} source = {grid3Data} headerOptions={headerOptions} columns = {columns3} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                            </div>
                        </Splitter>                        
                    </Splitter>
                </DynamicArea>
            </div>
        </>
    )


}

export default TeamReg;