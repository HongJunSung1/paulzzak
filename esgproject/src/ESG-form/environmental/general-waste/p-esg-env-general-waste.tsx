// 일반 폐기물 발생량
import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import DatePick from '../../../ESG-common/DatePicker/p-esg-common-datePicker.tsx'
import Loading from '../../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../../ESG-common/Grid/p-esg-common-grid.tsx';
import MessageBox from '../../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import GridTab from '../../../ESG-common/GridTab/p-esg-common-GridTab.tsx';
import GridTabItem from '../../../ESG-common/GridTab/p-esg-common-GridTabItem.tsx';
import { SP_Request } from '../../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    year    : string;
    DataSet : string;
}  

// 메시지 박스
let message : any     = [];
let title   : string  = "";

const GeneralWaste = ({strOpenUrl, openTabs, setIsDataChanged}) => {
    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [year , setYear] = useState('');

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
        setIsDataChanged(true);
        if(gridId === 'DataSet1'){
            setGrid1Changes(changes);
        } else if(gridId === 'DataSet2'){
            setGrid2Changes(changes);
        } else if(gridId === 'DataSet3'){
            setGrid3Changes(changes);
        }
    };

    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);
    const grid3Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_Env_GeneralWaste_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_Env_GeneralWaste_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_Env_GeneralWaste_Cut"}
     ]

    // 헤더 정보
    const complexColumns =[
                            {
                                header: '재활용',
                                name: 'mergeColumn1',
                                childNames: ['RecyclingPreProc', 'Recycling']
                            },
                            {
                                header: '소각',
                                name: 'mergeColumn2',
                                childNames: ['EnergyRecover', 'EnergyNonRecover']
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
        {name : "RecyclingPreProc"    , header: "재활용을\n위한 전처리", width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Recycling"           , header: "재활용"               , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Bury"                , header: "매립"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyRecover"       , header: "에너지회수"           , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyNonRecover"    , header: "에너지비회수"         , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Etc"                 , header: "기타"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Total"               , header: "소계"                 , width: 150, renderer : {type: 'sum', options:{sumAr: ["RecyclingPreProc", "Recycling", "Bury", "EnergyRecover", "EnergyNonRecover", "Etc"]}}}
     ]

     const columns2 = [
        {name : "GeneralWasteCD"      , header: "내부코드"             , width: 100, hidden: true},
        {name : "Year"                , header: "연도"                 , width: 100, renderer: {type: "datebox", options:{dateType:"year"}}},
        {name : "RecyclingPreProc"    , header: "재활용을\n위한 전처리", width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Recycling"           , header: "재활용"               , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Bury"                , header: "매립"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyRecover"       , header: "에너지회수"           , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyNonRecover"    , header: "에너지비회수"         , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Etc"                 , header: "기타"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Total"               , header: "소계"                 , width: 150, renderer : {type: 'sum', options:{sumAr: ["RecyclingPreProc", "Recycling", "Bury", "EnergyRecover", "EnergyNonRecover", "Etc"]}}}
     ]

     const columns3 = [
        {name : "GeneralWasteCD"      , header: "내부코드"             , width: 100, hidden: true},
        {name : "Year"                , header: "연도"                 , width: 100, renderer: {type: "datebox", options:{dateType:"year"}}},
        {name : "RecyclingPreProc"    , header: "재활용을\n위한 전처리", width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Recycling"           , header: "재활용"               , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Bury"                , header: "매립"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyRecover"       , header: "에너지회수"           , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "EnergyNonRecover"    , header: "에너지비회수"         , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Etc"                 , header: "기타"                 , width: 150, editor: 'text', renderer: {type: 'number'}},
        {name : "Total"               , header: "소계"                 , width: 150, renderer : {type: 'sum', options:{sumAr: ["RecyclingPreProc", "Recycling", "Bury", "EnergyRecover", "EnergyNonRecover", "Etc"]}}}
     ]

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                setGrid1Data([]);
                setGrid2Data([]);
                setGrid3Data([]);
                setGrid1Changes({DataSet : '', grid: []})
                setGrid2Changes({DataSet : '', grid: []})
                setGrid3Changes({DataSet : '', grid: []})
                // 데이터 변화 감지 값 false
                setIsDataChanged(false);
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        year : year,
                        DataSet  : 'DataSet1'
                    })

                    // 탭 이동 여부 초기화
                    setIsDataChanged(false);

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result[0].length > 0){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                            setGrid2Data(result[1]);
                            setGrid3Data(result[2]);
                        }else{
                            // 결과값이 없을 경우 처리 로직
                            // 조회 결과 초기화
                            setGrid1Data([]);
                            setGrid2Data([]);
                            setGrid3Data([]);

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
                //시트 입력 종료
                grid1Ref.current.setEditFinish();
                grid2Ref.current.setEditFinish();
                grid3Ref.current.setEditFinish();
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];
                
                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                grid2Changes.grid = grid2Ref.current.setColumCheck(grid2Changes.grid);
                grid3Changes.grid = grid3Ref.current.setColumCheck(grid3Changes.grid);
                
                combinedData.push(grid1Changes);
                combinedData.push(grid2Changes);
                combinedData.push(grid3Changes);

                // 저장할 데이터 없을 시 종료
                if(combinedData[0].grid.length === 0 && combinedData[1].grid.length === 0 && combinedData[2].grid.length === 0){
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
                                    errMsg.push({text: '시트 : Scope3 : '  + result[i][j].Message})
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
                        grid2Ref.current.setRowData(result[1]);
                        grid3Ref.current.setRowData(result[2]);
                        
                        //시트 변경 내역 초기화
                        setGrid1Changes({ DataSet : '', grid: []});
                        setGrid2Changes({ DataSet : '', grid: []});
                        setGrid3Changes({ DataSet : '', grid: []});

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
                checkedData.push(grid2Ref.current.getCheckedRows());
                checkedData.push(grid3Ref.current.getCheckedRows());

                setLoading(true);
                try {
                    // SP 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, checkedData);
                    if(result){
                        // SP 결과 값이 있을 때 로직
                        grid1Ref.current.removeRows(result[0]);
                        grid2Ref.current.removeRows(result[1]);
                        grid3Ref.current.removeRows(result[2]);

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
        if (openTabs.find(item => item.url === '/PEsgEnvGeneralWaste') === undefined) {
            setYear('');
            setGrid1Data([]);
            setGrid2Data([]);
            setGrid3Data([]);
            setGrid1Changes({DataSet : '', grid: []})
            setGrid2Changes({DataSet : '', grid: []})
            setGrid3Changes({DataSet : '', grid: []})
        }
    }, [openTabs]);

    return (
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgEnvGeneralWaste' ? "flex" : "none", flexDirection:"column"}}>
            <Loading loading={loading}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <Toolbar items={toolbar} clickID={toolbarEvent} />
            <FixedArea name={"조회 조건"}>
                <FixedWrap>
                    <DatePick name={"연도"}   value={year}  onChange={setYear} width={200} type={"year"} isGrid={false}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <GridTab>
                    <GridTabItem name={"글로벌"}>
                        <Grid ref={grid1Ref} gridId="DataSet1" title = "일반 폐기물 발생량(글로벌)" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                    </GridTabItem>
                    <GridTabItem name={"건설"}>
                        <Grid ref={grid2Ref} gridId="DataSet2" title = "일반 폐기물 발생량(건설)"   source = {grid2Data} headerOptions={headerOptions} columns = {columns2} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                    </GridTabItem>
                    <GridTabItem name={"모멘텀"}>
                        <Grid ref={grid3Ref} gridId="DataSet3" title = "일반 폐기물 발생량(모멘텀)" source = {grid3Data} headerOptions={headerOptions} columns = {columns3} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                    </GridTabItem>
                </GridTab>
            </DynamicArea>
        </div>
    )
}

export default GeneralWaste