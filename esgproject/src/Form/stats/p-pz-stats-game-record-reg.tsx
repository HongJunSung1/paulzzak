// 경기기록작성

import React, { useRef, useState, useEffect}  from 'react'
import '../../global.d.ts';
import styles from './p-pz-stats-game-record-reg.module.css';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import DatePick from '../../ESG-common/DatePicker/p-esg-common-datePicker.tsx'

import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    GameCD       : number;
    Date         : string;
    SeasonCD     : number;
    TeamACD      : number;
    TeamBCD      : number;
    DataSet      : string;
}  

// 에러 메세지
let message : any     = [];
let title   : string  = "";

const GameRecordReg = ({strOpenUrl, openTabs, jumpRowData, setJumpRowData}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [Key     , setKey]  = useState(0);     // 키값
    const [Date    , setDate] = useState('');
    const [SeasonCD, setSeasonCD] = useState(0);   // 서치박스
    const [TeamACD , setTeamACD]  = useState(0);   // 서치박스
    const [TeamBCD , setTeamBCD]  = useState(0);   // 서치박스
    const [isJump, setIsJump] = useState(false);
    const [SeasonName, setSeasonName] = useState('');
    const [TeamAName, setTeamAName] = useState('');
    const [TeamBName, setTeamBName] = useState('');


    const [resetTrigger, setResetTrigger] = useState(false); //서치박스 초기화하기
    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes, setGrid2Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            setGrid1Changes(changes);
        } else if (gridId === 'DataSet2') {
            setGrid2Changes(changes);
        } 
    };

    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);

    // 점프 전달 받은 값
    useEffect(() => {
        if (jumpRowData !== null && jumpRowData.length > 0) {
            setTimeout(async () => {
                setIsJump(true);
                const row          = jumpRowData[0].grid[0];
                const jumpGameCD   = row.GameCD;
                const jumpGameDate = row.GameDate;
                const jumpSeasonCD = row.SeasonCD;
                const jumpTeamACD  = row.TeamACD;
                const jumpTeamBCD  = row.TeamBCD;

                setTeamACD(jumpTeamACD);
                setTeamBCD(jumpTeamBCD);   
                setSeasonCD(jumpSeasonCD);    
                setDate(jumpGameDate);
                setKey(jumpGameCD);

                // 조회 조건 담기
                const conditionAr : condition =({
                    GameCD   : jumpGameCD  ,
                    Date     : jumpGameDate,
                    SeasonCD : jumpSeasonCD,
                    TeamACD  : jumpTeamACD ,
                    TeamBCD  : jumpTeamBCD ,
                    DataSet  : 'DataSet1'
                })
    
                if(jumpRowData[0].grid[0].GameCD > 0){
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request("S_PZ_Stat_GameRecordReg_Jump_Query", [conditionAr]);
                        
                        resetGeneralTable(); //일반테이블 초기화
                        if(result[0].length > 0){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                            setGrid2Data(result[1]);
            
                            // 무조건 팀 데이터 넘길 때는 TeamA, TeamB로 넘겨야 함(나머지 컬럼도 맞춰야 함)
                            // ✅ Overall 테이블 >> Overall 테이블은 자동 조회되는 영역으로 변경함
                            // if (result[2]) {
                            //     setTeamSummaryData(result[2]);
                            // }
                            
                            // ✅ Scoring 테이블
                            if (result[2]) {
                                setRunningScoreData(result[2]);
                            }

                            if (result[3]){
                                setSeasonName(result[3][0].SeasonName);
                                setTeamAName(result[3][0].TeamAName);
                                setTeamBName(result[3][0].TeamBName);
                            }
                        }else{
                            // 결과값이 없을 경우 처리 로직
                            // 조회 결과 초기화
                            setGrid1Data([]);
                            setGrid2Data([]);
                            resetGeneralTable(); 
                            message  = [];
                            message.push({text: "조회 결과가 없습니다."})
                            setMessageOpen(true);
                            title   = "조회 오류";
                            setJumpRowData(null); // 부모 상태 초기화
                            setLoading(false);
                        }
                    } catch (error) {
                            // SP 호출 시 에러 처리 로직
                            console.log(error);
                        }
            
                        // 수정된 내역 초기화
                        setGrid1Changes({DataSet : '', grid: []});
                        setGrid2Changes({DataSet : '', grid: []});
                        // 로딩뷰 감추기
                        setLoading(false);
                }
    
            }, 100)
        }
      }, [jumpRowData]);




    // xml로 저장하기 적합한 텍스트로 바꿔주기
    const convertToXmlSafe = (key: string) => {
        return key.replace(/^(\d)/, '_$1').replace(/[^a-zA-Z0-9]/g, '_');
    }

    // ✅ 요약 테이블 저장용 데이터 추출 함수
    const getTeamSummaryData = (): { [key: string]: any }[] => {
        const headers = [
          "Score",         // 득점
          "_2PSuccess",    // 2점 성공
          "_2PAttempt",    // 2점 시도
          "_3PSuccess",    // 3점 성공
          "_3PAttempt",    // 3점 시도
          "FTSuccess",     // 자유투 성공
          "FTAttempt",     // 자유투 시도
          "Rebound",
          "Assist",
          "Steal",
          "Block",
          "TurnOver",
          "Foul"
        ];

        const teamKeys = ["A", "B"];
        const result: Record<string, any>[] = [];
      
        teamKeys.forEach((team) => {
            const rowObj: Record<string, any> = {};
            const scoreText = document.getElementById(`score-team-${team.toLowerCase()}`)?.textContent || "0";
          
            rowObj[convertToXmlSafe("Team")] = `Team${team}`;        // ✅ 띄어쓰기 제거
            rowObj[convertToXmlSafe("Score")] = scoreText.trim();
          
            headers.slice(1).forEach((key) => {
              const input = document.getElementById(`${key}-${team}`) as HTMLInputElement;
              const safeKey = convertToXmlSafe(key);  // XML 태그명으로 안전한 이름
              rowObj[safeKey] = (input && typeof input.value === 'string') ? input.value.trim() : "0";
            });
            result.push(rowObj);
        });
      
        return result;
      };

    // Running Score 데이터 수집
    const getRunningScoreData = (): {
        Team: string;
        Quarter: number;
        Sequence: number;
        Jersey: string;
      }[] => {
        const result: {
          Team: string;
          Quarter: number;
          Sequence: number;
          Jersey: string;
        }[] = [];
      
        ['A', 'B'].forEach((team) => {
          for (let q = 0; q < 4; q++) {
            const inputs = document.querySelectorAll<HTMLInputElement>(
              `input[data-team="${team}"][data-quarter="${q}"]`
            );
      
            inputs.forEach((input, i) => {
              const jersey = input.value.trim();
              if (jersey !== "") {
                result.push({
                  Team: `Team${team}`,
                  Quarter: q + 1,      // ✅ 0-based → 1-based
                  Sequence: i + 1,     // ✅ 0-based → 1-based
                  Jersey: jersey,
                });
              }
            });
          }
        });
      
        return result;
      }; 


    type TeamSummaryRow = {
        Team: string;
        [key: string]: string | number;
      };

    // Overall 조회용 
    const setTeamSummaryData = (data: TeamSummaryRow[]) => {
        const excludedKeys = ["Team"];
        
        data.forEach((row) => {
          if (!row?.Team) return; // ← 필수 방어 코드
          const team = row.Team.replace("Team", ""); // "TeamA" → "A"
      
          Object.entries(row).forEach(([key, value]) => {
            if (excludedKeys.includes(key)) return;
            console.log(key + ", " + value)
            const el = document.getElementById(`${key}-${team}`) as HTMLInputElement;
            if (el) el.value = value?.toString?.() ?? "";
          });
        });
      };

      type RunningScoreRow = {
        Team: "A" | "B";
        Quarter: number;
        Sequence: number;
        Jersey: string;
      };

    // Scoring 조회용
    const setRunningScoreData = (data: RunningScoreRow[]) => {
        const grouped = data.reduce((acc, row) => {
          const team = row.Team.replace("Team", "");
          const quarter = Number(row.Quarter) - 1;
          const sequence = Number(row.Sequence) - 1;
      
          const key = `${team}-${quarter}`;
          if (!acc[key]) acc[key] = [];
          acc[key][sequence] = row.Jersey;
      
          return acc;
        }, {} as Record<string, string[]>);
      
        Object.entries(grouped).forEach(([key, jerseys]) => {
          const [team, quarter] = key.split("-");
          const inputs = document.querySelectorAll<HTMLInputElement>(
            `input[data-team="${team}"][data-quarter="${quarter}"]`
          );
      
          jerseys.forEach((jersey, i) => {
            if (inputs[i]) {
              inputs[i].value = jersey;
            }
          });
        });
      };


    

    const toolbar = [  
        {id: 0, title:"신규"  , image:"new"  , spName:""}
      , {id: 1, title:"조회"  , image:"query", spName:"S_PZ_Stat_GameRecordReg_Query"}
      , {id: 2, title:"저장"  , image:"save" , spName:"S_PZ_Stat_GameRecordReg_Save"}
      , {id: 3, title:"행삭제", image:"cut"  , spName:"S_PZ_Stat_GameRecordReg_Cut"}
      , {id: 4, title:"삭제"  , image:"cut"  , spName:"S_PZ_Stat_GameRecordReg_Delete"}
     ]


    // 헤더 정보
    const complexColumns =[
        {
            header: '2점슛',
            name: 'mergeColumn1',
            childNames: ['_2PSuccess', '_2PAttempt']
        },
        {
            header: '3점슛',
            name: 'mergeColumn2',
            childNames: ['_3PSuccess', '_3PAttempt']
        },
        {
            header: '자유투',
            name: 'mergeColumn3',
            childNames: ['FTSuccess', 'FTAttempt']
        }
    ]

    const headerOptions = {
        height: 60,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

     // 시트 컬럼 값
    const columns1 = [
        {name : "UserCD"     , header: "회원\n코드" , width:  50, hidden: true},
        {name : "IsGuest"    , header: "용병\n여부" , width:  50, renderer : {type: 'checkbox'}},
        {name : "BackNumber" , header: "등번호"     , width:  20, renderer : {type: 'number'}},
        {name : "UserName"   , header: "선수명"     , width: 100, renderer: {type: 'searchbox', options: {searchCode: 9, CodeColName :"UserCD", InfoCol1: "BackNumber"}}},
        {name : "Score"      , header: "득점"       , width:  60, renderer : {type: 'number'}},
        {name : "_2PSuccess" , header: "성공"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "_2PAttempt" , header: "시도"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "_3PSuccess" , header: "성공"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "_3PAttempt" , header: "시도"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "FTSuccess"  , header: "성공"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "FTAttempt"  , header: "시도"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Rebound"    , header: "리바운드"   , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Assist"     , header: "어시스트"   , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Steal"      , header: "스틸"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Block"      , header: "블록"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "TurnOver"   , header: "턴오버"     , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Foul"       , header: "파울"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
    ];

    const columns2 = [
        {name : "UserCD"     , header: "회원\n코드" , width:  50, hidden: true},
        {name : "IsGuest"    , header: "용병\n여부" , width:  50, renderer : {type: 'checkbox'}},
        {name : "BackNumber" , header: "등번호"     , width:  20, renderer : {type: 'number'}},
        {name : "UserName"   , header: "선수명"     , width: 100, renderer: {type: 'searchbox', options: {searchCode: 9, CodeColName :"UserCD", InfoCol1: "BackNumber"}}},
        {name : "Score"      , header: "득점"       , width:  60, renderer : {type: 'number'}},
        {name : "_2PSuccess" , header: "성공"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "_2PAttempt" , header: "시도"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "_3PSuccess" , header: "성공"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "_3PAttempt" , header: "시도"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "FTSuccess"  , header: "성공"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "FTAttempt"  , header: "시도"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Rebound"    , header: "리바운드"   , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Assist"     , header: "어시스트"   , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Steal"      , header: "스틸"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Block"      , header: "블록"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "TurnOver"   , header: "턴오버"     , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
        {name : "Foul"       , header: "파울"       , width:  60, editor: 'text', renderer : {type: 'number'}, disabled:false},
    ];


    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                setGrid1Data([]);
                setGrid2Data([]);
                setGrid1Changes({DataSet : '', grid: []})
                setGrid2Changes({DataSet : '', grid: []})
                
                setJumpRowData(null); // 점프 후 초기화
                setKey(0);
                resetGeneralTable(); //일반테이블 초기화
                setIsJump(false);
                setSeasonCD(0);
                setTeamACD(0);
                setTeamBCD(0);
                setDate('');
                break;

            // 조회
            case 1 :
                // 조회 조건 담기
                const conditionAr : condition =({
                    GameCD   : Key     ,
                    Date     : Date    ,
                    SeasonCD : SeasonCD,
                    TeamACD  : TeamACD,
                    TeamBCD  : TeamBCD,
                    DataSet  : 'DataSet1'
                })

                if (SeasonCD === 0 || TeamACD === 0 || TeamBCD === 0){
                    message  = [];
                    message.push({text: "시즌명, A팀, B팀을 모두 입력해주세요."})
                    setMessageOpen(true);
                    title   = "조회 오류";
                    return;
                }

                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                    
                    resetGeneralTable(); //일반테이블 초기화
                    if(result[0].length > 0){
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        setGrid1Data(result[0]);
                        setGrid2Data(result[1]);

                        // 무조건 팀 데이터 넘길 때는 TeamA, TeamB로 넘겨야 함(나머지 컬럼도 맞춰야 함)
                        // ✅ Overall 테이블 >> Overall 테이블은 자동 조회되는 영역으로 변경함
                        // if (result[2]) {
                        //     setTeamSummaryData(result[2]);
                        // }
                        
                        // ✅ Scoring 테이블
                        if (result[2]) {
                            setRunningScoreData(result[2]);
                        }
                        
                    }else{
                        // 결과값이 없을 경우 처리 로직
                        // 조회 결과 초기화
                        setGrid1Data([]);
                        setGrid2Data([]);
                        resetGeneralTable(); 
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

                    // 수정된 내역 초기화
                    setGrid1Changes({DataSet : '', grid: []});
                    setGrid2Changes({DataSet : '', grid: []});
                    
                    // 로딩뷰 감추기
                    setLoading(false);

                break;


            // 저장
            case 2 :
                //시트 입력 종료
                grid1Ref.current.setEditFinish();
                grid2Ref.current.setEditFinish();

                if (SeasonCD === 0 || TeamACD === 0 || TeamBCD === 0){
                    message  = [];
                    message.push({text: "시즌명, A팀, B팀을 모두 입력해주세요."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    return;
                }

                // ConditionAr은 조회하면서 담았기 때문에, 이 값을 그대로 적용할 지 고민
                // >> 값을 다 입력해놓고 조회조건 값을 변경하는 것을 방지
                // >> 일단은 저장용으로 새로 받음

                const key = document.getElementById('key') as HTMLInputElement;
                // console.log(key)
                if (jumpRowData && jumpRowData.length > 0 && jumpRowData[0].grid.length > 0) {
                    setKey(jumpRowData[0].grid[0].GameCD);
                } 
            

                const saveConditionAr : condition =({
                    GameCD   : Key,
                    Date     : Date    ,
                    SeasonCD : SeasonCD,
                    TeamACD  : TeamACD,
                    TeamBCD  : TeamBCD,
                    DataSet  : 'ConditionSet1'
                })

                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                grid2Changes.grid = grid2Ref.current.setColumCheck(grid2Changes.grid);

                // 데이터 저장
                combinedData.push(saveConditionAr);
                combinedData.push(grid1Changes)
                combinedData.push(grid2Changes)

                // ✅ 일반 테이블 데이터 추가
                // 1. 요약테이블
                const summaryRows = getTeamSummaryData().filter(row => Object.values(row).some(val => val !== "0" && val !== ""));
                
                if (summaryRows.length > 0) {
                  combinedData.push({ DataSet: "DataSet3", grid: summaryRows });
                }

                // Running Score 테이블
                const runningScoreRows = getRunningScoreData();
                if (runningScoreRows.length > 0) {
                  combinedData.push({ DataSet: "DataSet4", grid: runningScoreRows });
                }

                // 저장할 데이터 없을시 종료
                // 0번은 조회조건값이라 1번부터 검사
                if(combinedData[1].grid.length + combinedData[2].grid.length === 0){
                    message  = [];
                    message.push({text: "저장할 데이터가 없습니다."})
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
                                        errMsg.push({text: "시트: Team A " + result[i][j].Message})
                                    }
                                    if( i === '1'){
                                        errMsg.push({text: "시트: Team B " + result[i][j].Message})
                                    }
                                    if( i === '2'){
                                        if(result[i][j].Status == 99){
                                            errMsg.push({text: result[i][j].Message})
                                        }else {
                                            errMsg.push({text: "시트: Overall " + result[i][j].Message})
                                        }
                                    }
                                    if( i === '3'){
                                        errMsg.push({text: result[i][j].Message})
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

                        // 마스터 키 값 넣어주기
                        setKey(result[0][0].GameCD);

                        //시트 변경 내역 초기화
                        setGrid1Changes({ DataSet : '', grid: []});
                        setGrid2Changes({ DataSet : '', grid: []});

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


            // 선수 삭제
            case 3 :
                // 체크한 데이터 담기 
                let checkedData : any[] = [];
                const cutConditionAr : condition =({
                    GameCD   : Key     ,
                    Date     : Date    ,
                    SeasonCD : SeasonCD,
                    TeamACD  : TeamACD,
                    TeamBCD  : TeamBCD,
                    DataSet  : 'ConditionSet1'
                })

                checkedData.push(cutConditionAr);
                checkedData.push(grid1Ref.current.getCheckedRows());
                checkedData.push(grid2Ref.current.getCheckedRows());

                setLoading(true);
                try {
                    // SP 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, checkedData);
                    if(result){
                        let errMsg : any[] = [];

                        // SP 호출 결과 체크로직 처리
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    errMsg.push({text: result[i][j].Message})
                                }
                            }
                        }
                        if(errMsg.length > 0){
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "선수 삭제 에러";
                            setLoading(false);
                            return;
                        }   

                        // SP 결과 값이 있을 때 로직
                        grid1Ref.current.removeRows(result[0]);
                        grid2Ref.current.removeRows(result[0]);

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

            // 전체 삭제
            case 4 :
                // 체크한 데이터 담기 
                let checkedAllData : any[] = [];
                const DeleteConditionAr : condition =({
                    GameCD   : Key     ,
                    Date     : Date    ,
                    SeasonCD : SeasonCD,
                    TeamACD  : TeamACD,
                    TeamBCD  : TeamBCD,
                    DataSet  : 'ConditionSet1'
                })

                checkedAllData.push(DeleteConditionAr);
                // checkedAllData.push(grid1Ref.current.getCheckedRows());
                // checkedAllData.push(grid2Ref.current.getCheckedRows());
                // // ✅ 일반 테이블 데이터 추가
                // // 1. 요약테이블
                // const summaryRowsDel = getTeamSummaryData().filter(row => Object.values(row).some(val => val !== "0" && val !== ""));

                // if (summaryRowsDel.length > 0) {
                //     checkedAllData.push({ DataSet: "DataSet3", grid: summaryRowsDel });
                // }

                // // Running Score 테이블
                // const runningScoreRowsDel = getRunningScoreData();
                // if (runningScoreRowsDel.length > 0) {
                //     checkedAllData.push({ DataSet: "DataSet4", grid: runningScoreRowsDel });
                // }

                setLoading(true);
                try {
                    // SP 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, checkedAllData);
                    if(result){
                        let errMsg : any[] = [];

                        // SP 호출 결과 체크로직 처리
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    errMsg.push({text: result[i][j].Message})
                                }
                            }
                        }
                        if(errMsg.length > 0){
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "선수 삭제 에러";
                            setLoading(false);
                            return;
                        }   

                        // SP 결과 값이 있을 때 로직
                        grid1Ref.current.removeRows(result[0]);
                        grid2Ref.current.removeRows(result[0]);

                        setGrid1Data([]);
                        setGrid2Data([]);
                        setGrid1Changes({DataSet : '', grid: []})
                        setGrid2Changes({DataSet : '', grid: []})
                        setKey(0);
                        jumpRowData = [];
                        setIsJump(false);
                        setTeamAName('');
                        setTeamBName('');
                        setSeasonName('');
                        setTeamACD(0);
                        setTeamBCD(0);
                        setSeasonCD(0);
                        setDate('');
                        
                        // 일반 테이블 초기화
                        resetGeneralTable();

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

    // 쿼터 및 쿼터별 점수
    const quarters = ['1쿼터', '2쿼터', '3쿼터', '4쿼터'];
    const rows = Array.from({ length: 40 }, (_, i) => i + 1);

    const handleScoreInputChange = (
        _dummy: string,
        _team: 'A' | 'B',
        _rowIndex: number,
        _quarterIndex: number
      ) => {
        const teamKeys: ('A' | 'B')[] = ['A', 'B'];
      
        teamKeys.forEach((team) => {
          const gridRef = team === 'A' ? grid1Ref.current : grid2Ref.current;
          const gridInstance = gridRef?.getInstance();
          const allRows = gridInstance?.getData() || [];
      
          const scoreMap: Record<string, number> = {};
      
          for (let q = 0; q < 4; q++) {
            const quarterInputs = Array.from(
              document.querySelectorAll<HTMLInputElement>(`[data-team="${team}"][data-quarter="${q}"]`)
            );
      
            let prevIdx = -1;
            let prevScore = 0;
      
            quarterInputs.forEach((input, idx) => {
              const value = input.value.trim();
              if (!/^\d+$/.test(value)) return;
      
              const jersey = parseInt(value).toString();
              const score = idx + 1;
      
              const gained = prevIdx === -1 ? score : score - prevScore;
              scoreMap[jersey] = (scoreMap[jersey] || 0) + gained;
      
              prevIdx = idx;
              prevScore = score;
            });
          }
      
          // 득점 시트 반영
          allRows.forEach((row: any) => {
            const jersey = parseInt(row.BackNumber).toString();
            const score = scoreMap[jersey] || 0;
            gridInstance?.setValue(row.rowKey, 'Score', score.toString());
          });
        });
      
        // 그리고 Overall 점수 재계산
        updateTeamSummary();
      };

    // 요약계산함수
    const updateTeamSummary = () => {
        const teamAData = grid1Ref.current?.getInstance().getData() || [];
        const teamBData = grid2Ref.current?.getInstance().getData() || [];

        const teamAScore = teamAData.reduce((sum, row) => {
          const score = parseFloat(row.Score);
          return sum + (isNaN(score) ? 0 : score);
        }, 0);
      
        const teamBScore = teamBData.reduce((sum, row) => {
          const score = parseFloat(row.Score);
          return sum + (isNaN(score) ? 0 : score);
        }, 0);
      
        const teamADom = document.getElementById('score-team-a');
        const teamBDom = document.getElementById('score-team-b');
      
        if (teamADom) teamADom.textContent = teamAScore.toString();
        if (teamBDom) teamBDom.textContent = teamBScore.toString();
    };

    // 팀점수 포함 다른 데이터 자동 계산
    useEffect(() => {
        const interval = setInterval(() => {
          updateTeamSummaryFromGrid();
          updateTeamSummary();   //팀 점수
        }, 200); // 0.5초마다 갱신
      
        return () => clearInterval(interval); // 언마운트 시 클리어
    }, []);

    const updateTeamSummaryFromGrid = () => {
        const fieldsToSum = [
          "_2PSuccess",
          "_2PAttempt",
          "_3PSuccess",
          "_3PAttempt",
          "FTSuccess",
          "FTAttempt",
          "Rebound",
          "Assist",
          "Steal",
          "Block",
          "TurnOver",
          "Foul"
        ];
      
        const gridRefs = [
          { ref: grid1Ref, team: "A" },
          { ref: grid2Ref, team: "B" }
        ];
      
        gridRefs.forEach(({ ref, team }) => {
          const grid = ref.current?.getInstance();
          const rows = grid?.getData() || [];
      
          const summary: Record<string, number> = {};
          fieldsToSum.forEach((key) => (summary[key] = 0));
      
          rows.forEach((row) => {
            fieldsToSum.forEach((key) => {
              const val = parseInt(row[key] ?? "0");
              if (!isNaN(val)) {
                summary[key] += val;
              }
            });
          });
      
          // OVERALL 테이블에 반영
          fieldsToSum.forEach((key) => {
            const el = document.getElementById(`${key}-${team}`) as HTMLInputElement;
            if (el) el.value = summary[key].toString();
          });
        });
      };    



    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {
        const grid1Inst = grid1Ref.current.getInstance();
        const grid2Inst = grid2Ref.current.getInstance();
        if(ref === grid1Inst){
            grid2Ref.current.blur();
        }else if (ref === grid2Inst){
            grid1Ref.current.blur();
        }
    }

    // 일반 테이블 초기화
    const resetGeneralTable = () => {
            // ✅ OVERALL 테이블 초기화
            const summaryInputs = document.querySelectorAll<HTMLInputElement>('.TeamSummaryTable input');
            summaryInputs.forEach(input => input.value = '');

            const teamAScore = document.getElementById('score-team-a');
            const teamBScore = document.getElementById('score-team-b');
            if (teamAScore) teamAScore.textContent = '0';
            if (teamBScore) teamBScore.textContent = '0';

            // ✅ Running Score 초기화 (data-role 기반 선택)
            const runningInputs = document.querySelectorAll<HTMLInputElement>('input[data-role="running-input"]');
            runningInputs.forEach(input => input.value = '');
    }    

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PPzStatsGameRecordReg') === undefined) {
            // setYear('');
            // setBizUnitCD(0);
            setGrid1Data([]);
            setGrid2Data([]);
            setGrid1Changes({DataSet : '', grid: []})
            setGrid2Changes({DataSet : '', grid: []})
            setKey(0);
            setIsJump(false);
            setTeamAName('');
            setTeamBName('');
            setSeasonName('');
            setTeamACD(0);
            setTeamBCD(0);
            setSeasonCD(0);
            setDate('');
            // 일반 테이블 초기화
            resetGeneralTable();
        } 
    }, [openTabs]);



    return(
        <>
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PPzStatsGameRecordReg' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/> 
                <FixedArea name={"게임 일정"}>
                    <FixedWrap>
                        <span style={{marginTop:"3px", marginRight: "8px", zIndex: "99"}}>
                            <DatePick name={"날짜"}   value={Date}  onChange={setDate} width={200} type={"day"} isGrid={false}/>    
                        </span>
                        {isJump ? (
                        <>
                            <TextBox name={"시즌명"} value={SeasonName} onChange={setSeasonName} width={150} readOnly={true}/>    
                            <TextBox name={"A팀"} value={TeamAName} onChange={setTeamAName} width={150} readOnly={true}/>    
                            <TextBox name={"B팀"} value={TeamBName} onChange={setTeamBName} width={150} readOnly={true}/>
                        </>
                        ) : (
                        <>
                            <SearchBox name={"시즌명"} value={SeasonCD} isRequire={"true"} onChange={(val) => setSeasonCD(val.code)} width={200} searchCode={6} isGrid={false}/>
                            {SeasonCD > 0 && Date !== '' && (
                            <div style={{display:"flex", marginLeft: "5px"}}>
                                <SearchBox name={"A팀"} id="A-SearchBox" value={TeamACD} isRequire={"true"} onChange={(val) => setTeamACD(val.code)} width={200} searchCode={7} isGrid={false} joinCode={6} joinColumn={"SeasonCD"} columnCode={SeasonCD} resetTrigger={resetTrigger}/>
                                <SearchBox name={"B팀"} value={TeamBCD} isRequire={"true"} onChange={(val) => setTeamBCD(val.code)} width={200} searchCode={7} isGrid={false} joinCode={6} joinColumn={"SeasonCD"} columnCode={SeasonCD} resetTrigger={resetTrigger}/>
                            </div>
                            )}
                        </>
                        )}

                        <span style={{marginLeft: "auto", marginTop:"auto", fontSize: "12px"}} className={styles.KeyIndex}>
                            고유번호: <input id="key" readOnly value={Key} className={styles.KeyIndex} size={5}></input>
                        </span>
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <div style={{height:"100%", width: "100%"}}>
                        <Splitter SplitType={"horizontal"} FirstSize={67} SecondSize={33}>
                            <div style={{height:"100%", width: "100%"}}>
                                <Splitter SplitType={"vertical"} FirstSize={15} SecondSize={85}>
                                    <div style={{ height: "100%", width: "100%", overflowX: "auto" }} className={styles.TeamSummaryWrapper}>
                                        <table className={styles.TeamSummaryTable}>
                                            <thead>
                                                <tr>
                                                <th rowSpan={2}>OVERALL</th>
                                                <th rowSpan={2}>득점</th>
                                                <th colSpan={2}>2점슛</th>
                                                <th colSpan={2}>3점슛</th>
                                                <th colSpan={2}>자유투</th>
                                                <th rowSpan={2}>리바운드</th>
                                                <th rowSpan={2}>어시스트</th>
                                                <th rowSpan={2}>스틸</th>
                                                <th rowSpan={2}>블록</th>
                                                <th rowSpan={2}>턴오버</th>
                                                <th rowSpan={2}>파울</th>
                                                </tr>
                                                <tr>
                                                <th>성공</th><th>시도</th>
                                                <th>성공</th><th>시도</th>
                                                <th>성공</th><th>시도</th>
                                                </tr>
                                            </thead>
                                            <tbody id="summary-A">
                                                <tr>
                                                    <td>Team A</td>
                                                    <td id="score-team-a">0</td>
                                                    {/* {Array.from({ length: 12 }).map((_, i) => (
                                                        <td key={i}><input /></td>
                                                    ))} */}
                                                    <td><input id="_2PSuccess-A" readOnly/></td>
                                                    <td><input id="_2PAttempt-A" readOnly/></td>
                                                    <td><input id="_3PSuccess-A" readOnly/></td>
                                                    <td><input id="_3PAttempt-A" readOnly/></td>
                                                    <td><input id="FTSuccess-A" readOnly/></td>
                                                    <td><input id="FTAttempt-A" readOnly/></td>
                                                    <td><input id="Rebound-A"   readOnly/></td>
                                                    <td><input id="Assist-A"    readOnly/></td>
                                                    <td><input id="Steal-A"     readOnly/></td>
                                                    <td><input id="Block-A"     readOnly/></td>
                                                    <td><input id="TurnOver-A"  readOnly/></td>
                                                    <td><input id="Foul-A"      readOnly/></td>
                                                </tr>
                                            </tbody>
                                            <tbody id="summary-B">
                                                <tr>
                                                    <td>Team B</td>
                                                    <td id="score-team-b">0</td>
                                                    {/* {Array.from({ length: 12 }).map((_, i) => (
                                                        <td key={i}><input /></td>
                                                    ))} */}
                                                    <td><input id="_2PSuccess-B" readOnly/></td>
                                                    <td><input id="_2PAttempt-B" readOnly/></td>
                                                    <td><input id="_3PSuccess-B" readOnly/></td>
                                                    <td><input id="_3PAttempt-B" readOnly/></td>
                                                    <td><input id="FTSuccess-B" readOnly/></td>
                                                    <td><input id="FTAttempt-B" readOnly/></td>
                                                    <td><input id="Rebound-B"   readOnly/></td>
                                                    <td><input id="Assist-B"    readOnly/></td>
                                                    <td><input id="Steal-B"     readOnly/></td>
                                                    <td><input id="Block-B"     readOnly/></td>
                                                    <td><input id="TurnOver-B"  readOnly/></td>
                                                    <td><input id="Foul-B"      readOnly/></td>                                                
                                                </tr>
                                            </tbody>
                                            </table>
                                    </div>
                                    <div style={{height:"100%", width: "100%"}}>
                                        <div style={{height:"100%" , width: "100%"}}>
                                            <Splitter SplitType={"vertical"} FirstSize={50} SecondSize={50}>
                                            <div style={{height:"100%"}}>
                                                <Grid ref={grid1Ref} gridId="DataSet1" title = "Team A" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                                            </div>
                                            <div style={{height:"100%", width: "100%"}}>
                                                <Grid ref={grid2Ref} gridId="DataSet2" title = "Team B" source = {grid2Data} headerOptions={headerOptions} columns = {columns2} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                                            </div>
                                            </Splitter>
                                        </div>
                                    </div>
                                </Splitter>
                            </div>
                            <div className = {styles.RunningScoreArea}>
                                <div className = {styles.RunningScoreTitle}>
                                    Running Score
                                </div>
                                <div className = {styles.ScoreContainer}>
                                    {quarters.map((quarter, qIdx)=> (
                                        <table key={qIdx} className={styles.QuarterTable}>
                                            <thead className={styles.QuarterTableHead}>
                                                <tr>
                                                    <th colSpan={4}>{quarter}</th>
                                                </tr>
                                                <tr>
                                                    <th colSpan={2}>A</th>
                                                    <th colSpan={2}>B</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((num, idx) => (
                                                    <tr key={idx} className={styles.Scoreboard}>
                                                        <td colSpan={1}>
                                                            <input
                                                                type="text"
                                                                className={styles.InputCell}
                                                                data-role="running-input"
                                                                data-team="A"
                                                                data-quarter={qIdx}  // ✅ 쿼터 식별
                                                                // onChange={(e) => handleScoreInputChange(e.target.value, 'A', idx, qIdx)}
                                                                onInput={(e) => handleScoreInputChange(e.currentTarget.value, 'A', idx, qIdx)}
                                                            />
                                                        </td>
                                                        <td colSpan={1}>{num}</td>
                                                        <td colSpan={1}>{num}</td>
                                                        <td colSpan={1}>
                                                            <input
                                                                type="text"
                                                                className={styles.InputCell}
                                                                data-role="running-input"
                                                                data-team="B"
                                                                data-quarter={qIdx}
                                                                // onChange={(e) => handleScoreInputChange(e.target.value, 'B', idx, qIdx)}
                                                                onInput={(e) => handleScoreInputChange(e.currentTarget.value, 'A', idx, qIdx)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ))}
                                </div>
                            </div>
                        </Splitter>
                    </div>
                </DynamicArea>
        </div>
        </>
    )
}

export default GameRecordReg