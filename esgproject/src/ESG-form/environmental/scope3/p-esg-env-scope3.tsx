//scope3
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
import Splitter from "../../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import File from '../../../ESG-common/File/p-esg-common-File.tsx';
import Button from '../../../ESG-common/Button/p-esg-common-Button.tsx';
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

// 우클릭 조회 시 받는 내부코드 값
let Scope3CD = 0
let Scope3Title = ""; // 파일첨부 제목

const Scope3 = ({strOpenUrl, openTabs}) => {

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
    const [fileData , setFileData]  = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    
    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if(gridId === 'DataSet1'){
            setGrid1Changes(changes);
        }
    };

    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);


    // 삭제 시 받는 FileCD 값
    const [fileCD, setFileCD] = useState(0);

    // 파일 첨부 
    const fileRef : any = useRef(null);
    let [fileAr] = useState<gridAr>({DataSet: '', grid: []});

    // (파일첨부) 동적으로 화면 높이 구하기
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState<number>(0);


    // 우클릭 시 조회
    const rightClick1 = (event: React.MouseEvent) => {
        event.preventDefault();
        setTimeout(async () => {
            setFileData([]);
            Scope3CD    =  0;
            Scope3Title = '';
            if(grid1Ref.current.rightClick() !== null){
                Scope3CD = grid1Ref.current.rightClick().Scope3CD;
                Scope3Title = grid1Ref.current.rightClick().BizUnitName;
            }
            // 조회 조건 담기
            const conditionAr : any[] = [{Scope3CD : Scope3CD, DataSet : "FileSet1"}]

            if(Scope3CD > 0){
                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request("S_ESG_Env_Scope3_File_Query", conditionAr);
                    if(result[0].length > 0){
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        setFileData(result[0]);
                    } else{
                        // 결과값이 없을 경우 처리 로직
                        setLoading(false);
                        let errMsg : any[] = [];
                        errMsg.push({text: "데이터가 없습니다."});
                        setMessageOpen(true);
                        message = errMsg;
                        title   = "조회 내역 없음";
                    }
                } catch (error) {
                    // SP 호출 시 에러 처리 로직
                    console.log(error);
                }
                // 로딩뷰 감추기
                setLoading(false);
            } else {
                setFileData([]);
            }
        }, 100)
    }

    // 저장된 파일 삭제 로직 : file 공통에서 서버 테이블의 file 데이터를 삭제했을 때 fileCD 값을 주어 fileCD 변화를 감지, deleteFile 함수를 실행시킨다.
    useEffect(()=> {
        if(fileCD > 0){
            deleteFile(fileCD);
        }
    }, [fileCD]);


    const deleteFile = async (fileCD) => {
        setLoading(true);
        setTimeout(async () => {
            try{
                const result = await SP_Request("S_ESG_Env_Scope3_File_Cut", [{FileCD: fileCD, Scope3CD : Scope3CD, DataSet: "FileSet1"}]);
                if(result){
                    let errMsg : any[] = [];
                    errMsg.push({text: "삭제 완료 되었습니다."});
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "삭제 완료";
                    
                    // fileCD 값 초기화
                    setFileCD(0);
                }
            } catch(error){
                // SP 호출 시 에러 처리 로직
                console.log(error);
            }
        }, 100)
        // 로딩뷰 감추기
        setLoading(false);
    }

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_Env_Scope3_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_Env_Scope3_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_Env_Scope3_Cut"}
     ]

    // 헤더 정보
    const complexColumns =[]

    const headerOptions = {
        height: 60,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

     // 시트 컬럼 값
     const columns1 = [
        {name : "Scope3CD"             , header: "내부코드"                                  , width:  70, hidden: true},
        {name : "Year"                 , header: "연도"                                      , width: 100, renderer: {type: "datebox", options:{dateType:"year"}}},
        {name : "CompanyName"          , header: "회사명"                                    , width: 150 , renderer: {type: "searchbox", options: {searchCode: 6, CodeColName :"CompanyCD"}}},
        {name : "CompanyCD"            , header: "회사 코드"                                 , width: 100 , hidden : true},
        {name : "BizUnitName"          , header: "사업부문"                                  , width: 150 , renderer: {type: "searchbox", options: {searchCode: 7, CodeColName :"BizUnitCD"}}},
        {name : "BizUnitCD"            , header: "사업부문 코드"                             , width: 100 , hidden : true},
        {name : "PurItemService"       , header: "1.  구매한 제품\n및 서비스"                , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "CapitalGoods"         , header: "2.  자본재"                                , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "ExceptFuelEnergy"     , header: "3.  Scope 1,2에 포함되지\n않는 연료&에너지", width: 150, editor: 'text', renderer : {type: 'number'}},
        {name : "UpLogistics"          , header: "4.  업스트림\n운송 및 물류"                , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "WorkWasted"           , header: "5.  작업 중\n발생한 폐기물"                , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "BusinessTrip"         , header: "6.  출장"                                  , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "Commute"              , header: "7.  직원 출퇴근"                           , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "UpLeaseProperties"    , header: "8.  업스트림\n임대(차) 자산"               , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "DownLogistics"        , header: "9.  다운스트림\n운송 및 물류"              , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "SoldItemManufacturing", header: "10. 판매된\n제품의 가공"                   , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "SoldItemUse"          , header: "11. 판매된\n제품의 사용"                   , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "SoldItemWasted"       , header: "12. 판매된\n제품의 폐기"                   , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "DownLeaseProperties"  , header: "13. 다운스트림\n임대(차) 자산"             , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "Franchise"            , header: "14. 프랜차이즈"                            , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "Investment"           , header: "15. 투자"                                  , width: 100, editor: 'text', renderer : {type: 'number'}},
        {name : "OtherUpEmission"      , header: "16. 기타 업스트림\n배출량"                 , width: 120, editor: 'text', renderer : {type: 'number'}},
        {name : "OtherDownEmission"    , header: "17. 기타 다운스트림\n배출량"               , width: 120, editor: 'text', renderer : {type: 'number'}},
        {name : "Total"                , header: "소계"                                      , width: 120, renderer : {type: 'sum', options:{sumAr : ["PurItemService", "CapitalGoods", "ExceptFuelEnergy", "UpLogistics", "WorkWasted", "BusinessTrip", "Commute", "UpLeaseProperties", "DownLogistics", "SoldItemManufacturing", "SoldItemUse", "SoldItemWasted", "DownLeaseProperties", "Franchise", "Investment", "OtherUpEmission", "OtherDownEmission"]}}},
    ];

    const columns2 = [
        {name : "Year"                 , header: "연도"                                     , width: 150 },
        {name : "CompanyName"          , header: "회사명"                                   , width: 150 },
        {name : "BizUnitName"          , header: "사업부문"                                 , width: 150 },
        {name : "PurItemService"       , header: "1.  구매한 제품\n및 서비스"                , width: 100, renderer : {type: 'number'}},
        {name : "CapitalGoods"         , header: "2.  자본재"                               , width: 100, renderer : {type: 'number'}},
        {name : "ExceptFuelEnergy"     , header: "3.  Scope 1,2에 포함되지\n않는 연료&에너지", width: 150, renderer : {type: 'number'}},
        {name : "UpLogistics"          , header: "4.  업스트림\n운송 및 물류"                , width: 100, renderer : {type: 'number'}},
        {name : "WorkWasted"           , header: "5.  작업 중\n발생한 폐기물"                , width: 100, renderer : {type: 'number'}},
        {name : "BusinessTrip"         , header: "6.  출장"                                  , width: 100, renderer : {type: 'number'}},
        {name : "Commute"              , header: "7.  직원 출퇴근"                           , width: 100, renderer : {type: 'number'}},
        {name : "UpLeaseProperties"    , header: "8.  업스트림\n임대(차) 자산"               , width: 100, renderer : {type: 'number'}},
        {name : "DownLogistics"        , header: "9.  다운스트림\n운송 및 물류"              , width: 100, renderer : {type: 'number'}},
        {name : "SoldItemManufacturing", header: "10. 판매된\n제품의 가공"                   , width: 100, renderer : {type: 'number'}},
        {name : "SoldItemUse"          , header: "11. 판매된\n제품의 사용"                   , width: 100, renderer : {type: 'number'}},
        {name : "SoldItemWasted"       , header: "12. 판매된\n제품의 폐기"                   , width: 100, renderer : {type: 'number'}},
        {name : "DownLeaseProperties"  , header: "13. 다운스트림\n임대(차) 자산"             , width: 100, renderer : {type: 'number'}},
        {name : "Franchise"            , header: "14. 프랜차이즈"                            , width: 100, renderer : {type: 'number'}},
        {name : "Investment"           , header: "15. 투자"                                  , width: 100, renderer : {type: 'number'}},
        {name : "OtherUpEmission"      , header: "16. 기타 업스트림\n배출량"                 , width: 120, renderer : {type: 'number'}},
        {name : "OtherDownEmission"    , header: "17. 기타 다운스트림\n배출량"               , width: 120, renderer : {type: 'number'}},
        {name : "Total"                , header: "소계"                                      , width: 120, renderer : {type: 'sum', options:{sumAr : ["PurItemService", "CapitalGoods", "ExceptFuelEnergy", "UpLogistics", "WorkWasted", "BusinessTrip", "Commute", "UpLeaseProperties", "DownLogistics", "SoldItemManufacturing", "SoldItemUse", "SoldItemWasted", "DownLeaseProperties", "Franchise", "Investment", "OtherUpEmission", "OtherDownEmission"]}}},
    ];


    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                setGrid1Data([]);
                setGrid2Data([]);

                Scope3CD    =  0;
                Scope3Title = '';

                // 수정된 내역 초기화
                setGrid1Changes({DataSet : '', grid: []});                
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        year : year,
                        DataSet  : 'DataSet1'
                    })

                    // 파일 데이터 초기화
                    setFileData([]);
                    Scope3CD    =  0;
                    Scope3Title = '';

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result[0].length > 0){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                            setGrid2Data(result[1]);
                        }else{
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


                const fileSaveResult = await fileRef.current.handleSave();
                if(fileSaveResult !== null && fileSaveResult !== undefined){
                    for(let i=0;i<fileSaveResult.length;i++){
                        fileSaveResult[i].Scope3CD = Scope3CD;
                    }
                    fileAr.DataSet = 'FileSet1';
                    fileAr.grid = fileSaveResult;
                    combinedData.push(fileAr);
                } else{
                    Scope3CD = 0;
                }
                
                combinedData.push(grid1Changes);
                
                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length === 0 ){
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

                        // 시트 값 입력
                        grid1Ref.current.setRowData(result[0]);
                        setFileData(result[1]);
                        
                        //시트 변경 내역 초기화
                        setGrid1Changes({ DataSet : '', grid: []});

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
                    if(result.length > 0){
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

    // 선택행 알림 전송
    const sendAlarm = async () =>{
        // 체크행 가져오기
        const alarmList = grid1Ref.current.getCheckedRows();

        alarmList.grid.forEach(item => {
            item.SheetNum  = "1"; // 시트 순번 지정
            item.TableKey1 = item.Scope3CD; // 공통 키값1(마스터) 추가 없을 경우 0
            item.TableKey2 = 0;             // 공통 키값2(디테일) 추가 없을 경우 0
            delete item.Scope3CD; // 기존 키값 삭제
        });

        // 체크행 있을 경우 알림 전송
        if(alarmList.grid.length > 0){
            const result = await SP_Request("S_ESG_SendAlarm", [alarmList], strOpenUrl);

            if(result){
                let errMsg : any[] = [];
                // SP 호출 결과 값 처리
                for(let i in result){
                    for(let j in result[i]){
                        if(result[i][j].Status > 0){
                            errMsg.push({text: "시트: Scope 1 - 2 " + result[i][j].Message})
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

                errMsg  = [];
                errMsg.push({text: "알림 전송 완료하였습니다."})
                setMessageOpen(true);
                message = errMsg;
                title   = "저장 완료";
            } else{
                // SP 호출 결과 없을 경우 처리 로직
                console.log("저장 에러");
            }
        }
    }

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

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgEnvScope3') === undefined) {
            setYear('');
            setGrid1Data([]);
            setGrid2Data([]);
        }
    }, [openTabs]);


    // 파일 첨부 화면 높이 0 방지
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgEnvScope3') !== undefined) {
          setTimeout(() => {
            if (containerRef.current) {
              setContainerHeight(containerRef.current.clientHeight);
              for (let i = 0; i < 1000; i++) {
                setTimeout(() => {
                  if (containerRef.current) {
                    setContainerHeight(containerRef.current.clientHeight);
                  }
                  if (containerHeight > 0) {
                    return;
                  }
                }, 1000 * i);
              }
            }
          }, 100);
        }
      }, [openTabs, containerHeight]);


    return (
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgEnvScope3' ? "flex" : "none", flexDirection:"column"}}>
            <Loading loading={loading}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <Toolbar items={toolbar} clickID={toolbarEvent} />
            <FixedArea name={"조회 조건"}>
                <FixedWrap>
                    <DatePick name={"연도"}   value={year}  onChange={setYear} width={200} type={"year"} isGrid={false}/>    
                    <Button name={"알림 전송"} clickEvent={sendAlarm}/> 
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Splitter SplitType={"vertical"} FirstSize={70} SecondSize={30}>
                    <div style={{width: "100%", height: "100%"}} ref={containerRef} >
                        {strOpenUrl === '/PEsgEnvScope3' &&
                        <Splitter SplitType={"horizontal"} FirstSize={60} SecondSize={40}>
                        <div onContextMenu={rightClick1} style={{height: "100%"}} >
                            <Grid ref={grid1Ref} gridId="DataSet1" title = "Scope 3" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                        </div>
                        <div style={{height: containerHeight + "px"}}>
                            <File openUrl={strOpenUrl} ref={fileRef} source={fileData} fileCD = {setFileCD} fileTitle={Scope3Title}/>
                        </div>
                        </Splitter>}
                    </div>
                    <Grid ref={grid2Ref} gridId="DataSet2" title = "사업부문별 합계" source = {grid2Data} headerOptions={headerOptions} columns = {columns2} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                </Splitter>
            </DynamicArea>
        </div>
    )
}

export default Scope3;