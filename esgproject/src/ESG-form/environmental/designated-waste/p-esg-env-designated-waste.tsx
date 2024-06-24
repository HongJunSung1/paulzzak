// 지정 폐기물 발생량
import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import DatePick from '../../../ESG-common/DatePicker/p-esg-common-datePicker.tsx'
import SearchBox from '../../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import Loading from '../../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    year      : string;
    bizUnitCD : number;
    DataSet   : string;
}  

// 메시지 박스
let message : any     = [];
let title   : string  = "";

const DesignatedWaste = ({strOpenUrl, openTabs, setIsDataChanged}) => {
    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [year     , setYear] = useState('');
    const [bizUnitCD, setBizUnitCD] = useState(0);

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    
    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        setIsDataChanged(true);
        if(gridId === 'DataSet1'){
            setGrid1Changes(changes);
        } 
    };

    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_Env_DesignatedWaste_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_Env_DesignatedWaste_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_Env_DesignatedWaste_Cut"}
     ]

    // 헤더 정보
    const complexColumns =[
        {
            header: '재활용',
            name: 'mergeColumn1',
            childNames: ['RecyclingPreProc', 'Recycling', 'TotalRecycle']
        },
        {
            header: '소각',
            name: 'mergeColumn2',
            childNames: ['EnergyRecover', 'EnergyNonRecover', 'TotalEnergy']
        }
      ]

    const headerOptions = {
        height: 80,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

    // 시트 컬럼 값
    const columns1 = [
        {name : "GeneralWasteCD"      , header: "내부코드"             , width: 100, hidden: true},
        {name : "Year"                , header: "연도"                 , width: 100, renderer: {type: "datebox", options:{dateType:"year"}}},
        {name : "BizUnitCD"           , header: "사업부문코드"         , width: 100, hidden: true},
        {name : "BizUnitName"         , header: "사업부문"             , width: 170, renderer: {type: 'searchbox', options: {searchCode: 7, CodeColName :"BizUnitCD"}}},
        {name : "RecyclingPreProc"    , header: "재활용을\n위한 전처리", width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Recycling"           , header: "재활용"               , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "TotalRecycle"        , header: "소계"                 , width: 150, renderer : {type: 'sum'    , options:{sumAr: ["RecyclingPreProc", "Recycling"]}}},
        {name : "Bury"                , header: "매립"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyRecover"       , header: "에너지회수"           , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyNonRecover"    , header: "에너지비회수"         , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "TotalEnergy"         , header: "소계"                 , width: 150, renderer : {type: 'sum'    , options:{sumAr: ["EnergyRecover", "EnergyNonRecover"]}}},
        {name : "Etc"                 , header: "기타"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Total"               , header: "소계"                 , width: 150, renderer : {type: 'sum'    , options:{sumAr: ["RecyclingPreProc", "Recycling", "Bury", "EnergyRecover", "EnergyNonRecover", "Etc"]}}},
        {name : "RecyclePortion"      , header: "재활용률"             , width: 150, renderer : {type: 'percent', options:{sumAr: ["RecyclingPreProc", "Recycling"], divideAr: ["RecyclingPreProc", "Recycling", "Bury", "EnergyRecover", "EnergyNonRecover", "Etc"]}}}
    ]


    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                setGrid1Data([]);
                setGrid1Changes({DataSet : '', grid: []})
                // 데이터 변화 감지 값 false
                setIsDataChanged(false);
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        year : year,
                        bizUnitCD : bizUnitCD,
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

                            // 탭 이동 여부 초기화
                            setIsDataChanged(false);
                        }else{
                            // 결과값이 없을 경우 처리 로직
                            // 조회 결과 초기화
                            setGrid1Data([]);

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

                    // 로딩뷰 감추기
                    setLoading(false);

                break;
            
            // 저장
            case 2 :
                //시트 입력 종료
                grid1Ref.current.setEditFinish();
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];
                
                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                
                combinedData.push(grid1Changes);

                // 저장할 데이터 없을 시 종료
                if(combinedData[0].grid.length === 0){
                    message  = [];
                    message.push({text: "저장할 데이터가 없습니다."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    setLoading(false);
                    return;
                }
                
                setLoading(true); 
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);

                    if(result.length > 0){
                        let errMsg : any[] = [];
                        // SP 호출 결과 값 처리
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    errMsg.push({text: '시트 : 일반 폐기물 발생량 : '  + result[i][j].Message})
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
                        
                        // 시트 값 입력
                        grid1Ref.current.setRowData(result[0]);
                        
                        //시트 변경 내역 초기화
                        setGrid1Changes({ DataSet : '', grid: []});

                        // 화면 이동 가능하도록 변경
                        setIsDataChanged(false);

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

                setLoading(true);
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
        }
      
    }

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {
        ;
    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgEnvDesignatedWaste') === undefined) {
            setYear('');
            setGrid1Data([]);
            setGrid1Changes({DataSet : '', grid: []})
        }
    }, [openTabs]);

    return (
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgEnvDesignatedWaste' ? "flex" : "none", flexDirection:"column"}}>
            <Loading loading={loading}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <Toolbar items={toolbar} clickID={toolbarEvent} />
            <FixedArea name={"조회 조건"}>
                <FixedWrap>
                    <DatePick name={"연도"}   value={year}  onChange={setYear} width={200} type={"year"} isGrid={false}/>    
                    <SearchBox name={"부서명"} value={bizUnitCD} onChange={setBizUnitCD} searchCode={7} width={200} isGrid={false}/>   
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Grid ref={grid1Ref} gridId="DataSet1" title = "지정 폐기물 발생량" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
            </DynamicArea>
        </div>
    )
}

export default DesignatedWaste