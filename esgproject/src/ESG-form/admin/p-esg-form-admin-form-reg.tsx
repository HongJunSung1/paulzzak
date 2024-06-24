// 화면 등록

import React, { useEffect, useRef, useState }  from 'react'
import '../../global.d.ts';

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
    FormName   : string;
    FormUrl    : string;
    DataSet    : string;
}  

// 메시지 박스
let message : any    = [];
let title   : string = "";

const FormReg = ({strOpenUrl, openTabs}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};
    
    // 조회조건 값
    const [FormName, setCondition1] = useState('');
    const [FormUrl  , setCondition2] = useState('');

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
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_Form_Admin_FormReg_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_Form_Admin_FormReg_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_Form_Admin_FormReg_Cut"}
     ]

    // 헤더 정보
    const complexColumns =[]

    const headerOptions = {
        height: 60,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

     // 시트 컬럼 값
     const columns1 = [
        {name : "FormCD"    , header: "화면코드", width:  70},
        {name : "FormName"  , header: "화면명"  , width: 300, editor: 'text', disabled:false},
        {name : "FormUrl"   , header: "화면URL" , width: 300, editor: 'text', disabled:false},
    ];

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
                        FormName : FormName,
                        FormUrl  : FormUrl,
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
            
            // 저장
            case 2 :
                setLoading(true); 
                //시트 입력 종료
                grid1Ref.current.setEditFinish();
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                
                combinedData.push(grid1Changes);

                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length === 0){
                    message  = [];
                    message.push({text: "저장할 데이터가 없습니다."})
                    setMessageOpen(true);
                    title   = "저장 오류";
                    setLoading(false);
                    return;
                }

                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        grid1Ref.current.setRowData(result[0]);
                        message  = [];
                        message.push({text: "저장이 완료되었습니다."})
                        setMessageOpen(true);
                        title   = "저장 완료";
                        setLoading(false);
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        message  = [];
                        message.push({text: "저장 시 오류가 발생했습니다. 다시 시도해주세요."})
                        setMessageOpen(true);
                        title   = "저장 오류";
                        setLoading(false);
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
        }
      
    }

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {

    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgFormAdminFormReg') === undefined) {
            setCondition1('');
            setCondition2('');
            setGrid1Data([]);
            setGrid1Changes({DataSet : '', grid: []});
        }
    }, [openTabs]);

    // console.log(openTabs.find(item => item.url === '/PEsgFormAdminFormReg'));

    // if(strOpenUrl === '/PEsgFormAdminFormReg')
    return (
        <>
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgFormAdminFormReg' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"조회 조건"}>
                    <FixedWrap>
                        <TextBox name={"화면명"}  value={FormName} onChange={setCondition1} width={300}/>    
                        <TextBox name={"화면 URL"} value={FormUrl} onChange={setCondition2} width={300}/>
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "화면 정보" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                </DynamicArea>
            </div>
        </>
    )
}

export default FormReg;