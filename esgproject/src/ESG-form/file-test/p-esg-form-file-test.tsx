//사용자별 화면 권한
import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';
import File from '../../ESG-common/File/p-esg-common-File.tsx';


type gridAr = {
    DataSet    : string;
    grid       : any[];
};

// 메시지 박스
let message : any     = [];
let title   : string  = "";

// 우클릭 조회 시 받는 내부코드 값
let UserCD = 0

const FileTest = ({strOpenUrl, openTabs}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if(gridId === 'DataSet1'){
            grid1Changes = changes;
        } 
    };

    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_File_Test_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_File_Test_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_File_Test_Cut"}
    ]

     // 시트 컬럼 값
     const columns1 = [
        {name : "UserCD"    , header: "사용자코드"     , width:  70 , hidden: true},
        {name : "UserName"  , header: "사용자명"       , width: 200},
        {name : "UserID"    , header: "사용자 아이디"  , width: 200},
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
                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, []);
                        
                        if(result[0].length > 0){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                        } else{
                            setLoading(false);
                            // 결과값이 없을 경우 처리 로직
                            let errMsg : any[] = [];
                            errMsg.push({text: "조회 결과가 없습니다."})
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "조회 에러";
                            setLoading(false);
                            return;
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
                    setLoading(false);
                    let errMsg : any[] = [];
                    errMsg.push({text: "저장할 데이터가 없습니다."})
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "저장 에러";
                    return;
                }

                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        grid1Ref.current.setRowData(result[0]);
                        setLoading(false);
                        let errMsg : any[] = [];
                        errMsg.push({text: "저장이 완료되었습니다."})
                        setMessageOpen(true);
                        message = errMsg;
                        title   = "저장 완료";
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        setLoading(false);
                        let errMsg : any[] = [];
                        errMsg.push({text: "저장 중 오류가 발생했습니다."})
                        setMessageOpen(true);
                        message = errMsg;
                        title   = "저장 오류";
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
                        setLoading(false);
                        let errMsg : any[] = [];
                        errMsg.push({text: "삭제할 데이터가 없습니다."})
                        setMessageOpen(true);
                        message = errMsg;
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
                            setLoading(false);
                            let errMsg : any[] = [];
                            errMsg.push({text: "삭제가 완료되었습니다."})
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "삭제 완료";
                        } else{
                            // SP 결과 값이 없을 때 로직
                            setLoading(false);
                            let errMsg : any[] = [];
                            errMsg.push({text: "삭제가 실패하였습니다."})
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "삭제 오류";
                        }
                    } catch (error) {
                        // SP 호출 시 에러 처리
                        console.log(error);
                    }
                    setLoading(false);

                break;
        }
      
    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgFormFileTest') === undefined) {
            setGrid1Data([]);
        }
    }, [openTabs]);

    // 우클릭 시 조회
    const rightClick1 = (event: React.MouseEvent) => {
        event.preventDefault();
        setTimeout(async () => {
            console.log('우클릭')
        })
    }

    if(strOpenUrl === '/PEsgFormFileTest')
    return (
    <>
        <Loading loading={loading}/>
        <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
        <Toolbar items={toolbar} clickID={toolbarEvent}/>
        <DynamicArea>
                <Splitter SplitType={"horizontal"} FirstSize={60} SecondSize={40}>
                    <div onContextMenu={rightClick1} style={{height:"100%"}}>
                        <Grid ref={grid1Ref} gridId="DataSet1" title = "사용자 정보" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
                    </div>
                    <div>
                        <File/>
                    </div>
                </Splitter>
        </DynamicArea>
    </>
    )
}

export default FileTest;
