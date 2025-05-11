// 계정 관리

import React, { useRef, useState, useEffect}  from 'react'
import '../../global.d.ts';
import SHA256 from 'crypto-js/sha256';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Button from "../../ESG-common/Button/p-esg-common-Button.tsx";
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import File from '../../ESG-common/File/p-esg-common-File.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    UserName     : string;
    UserID       : string;
    TelNo        : string;
    DataSet      : string;
}  

// 에러 메세지
let message : any     = [];
let title   : string  = "";

// 우클릭 조회 시 받는 내부코드 값
let UserCD = 0

const UserInfo = ({strOpenUrl, openTabs}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [UserName          , setCondition1]  = useState('')
    const [UserID            , setCondition2]  = useState('')
    const [TelNo             , setCondition3]  = useState('')

    // 우클릭 조회 시트명 변경
    const [RightClickUserName, setRightClickUserName] = useState('');
    const [isRightClick, setIsRightClick] = useState(false);

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [fileData, setFileData] = useState([]);

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

    // 삭제 시 받는 FileCD 값
    const [fileCD, setFileCD] = useState(0);

    // 파일 첨부 
    const fileRef : any = useRef(null);
    let [fileAr] = useState<gridAr>({DataSet: '', grid: []});

    // 우클릭 시 조회
    const rightClick1 = (event: React.MouseEvent) => {
        event.preventDefault();
        setTimeout(async () => {
            setFileData([]);
            UserCD = 0;
            setRightClickUserName('');
            if(grid1Ref.current.rightClick() !== null){
                UserCD = grid1Ref.current.rightClick().UserCD;
                setRightClickUserName(grid1Ref.current.rightClick().UserName);
                setIsRightClick(true);
            }
            // 조회 조건 담기
            const conditionAr : any[] = [{UserCD : UserCD, DataSet : "DataSet1"}]

            if(UserCD > 0){
                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request("S_Admin_UserInfo_Sub_File_Query", conditionAr);
                    if(result.length > 0){
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
                const result = await SP_Request("S_Admin_UserInfo_Sub_File_Cut", [{FileCD: fileCD, UserCD : UserCD, DataSet: "DataSet1"}]);
                console.log(result)
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

    // 클릭 이벤트
    const clickEvent = async () => {
        // 체크한 데이터 담기 
        let checkedData : any[] = [];

        checkedData.push(grid1Ref.current.getCheckedRows());

        if(checkedData[0].grid.length === 0 ){
            return;
        }

        if(checkedData[0].grid.length > 1 ){
            let errMsg : any[] = [];
            errMsg.push({text: "두 개 이상의 계정을 초기화할 수 없습니다."})
            setMessageOpen(true);
            message = errMsg;
            title   = "초기화 에러";
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // SP 결과 값 담기
            const initPW = SHA256('1234').toString();
            checkedData[0].grid[0].initPW = initPW;

            const result = await SP_Request("S_Admin_Password_Init", checkedData);
            
            if(result){
                setLoading(false);
                // SP 결과 값이 있을 때 로직
                let completeMsg : any[] = [];
                completeMsg.push({text: "아이디 " + result[0][0].UserID + "의 비밀번호가 초기화되었습니다."})
                setMessageOpen(true);
                message = completeMsg;
                title   = "저장 완료";
            } else{
                // SP 결과 값이 없을 때 로직
                let failMsg : any[] = [];
                failMsg.push({text: "초기화 할 아이디가 없습니다."})
                setMessageOpen(true);
                message = failMsg;
                title   = "저장 실패";
            }
        } catch (error) {
            // SP 호출 시 에러 처리
            console.log(error);
        }
        setLoading(false);

    }

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_Admin_UserInfo_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_Admin_UserInfo_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_Admin_UserInfo_Cut"}
     ]

    // 헤더 정보
    const complexColumns =[]

    const headerOptions = {
        height: 60,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    };

     // 시트 컬럼 값
     const columns1 = [
        {name : "UserCD"         , header: "유저코드"   , width:  70, hidden: true},
        {name : "UserID"         , header: "아이디"     , width: 100, editor: 'text'},
        {name : "UserName"       , header: "이름"       , width: 100, editor: 'text'},
        {name : "TelNo"          , header: "전화번호"   , width: 160, editor: 'text'},
        {name : "GroupCD"        , header: "그룹코드"   , width:  70, hidden: true},
        {name : "GroupName"      , header: "사용자권한" , width: 170, renderer: {type: 'searchbox', options: {searchCode: 4, CodeColName :"GroupCD"}}},
        {name : "RegDateTime"    , header: "등록일"  , width: 160},
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                grid1Ref.current.clear();
                setGrid1Data([]);
                setFileCD(0);
                setFileData([]);
                setRightClickUserName('');
                setIsRightClick(false);
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        UserName    : UserName,
                        UserID      : UserID,
                        TelNo       : TelNo,
                        DataSet     : 'DataSet1'
                    })
                    //우클릭 조회 초기화
                    setFileData([]);
                    setRightClickUserName('');

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result[0].length > 0){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                        } else{
                            // 결과값이 없을 경우 처리 로직
                            // 조회 결과 초기화
                            setGrid1Data([]);
                            let errMsg : any[] = [];
                            errMsg.push({text: "조회 결과가 없습니다."})
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "조회 오류";
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

                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                if(!isRightClick){
                    if(RightClickUserName == ''){
                        message  = [];
                        message.push({text: "계정 우클릭 후 저장해주세요."});
                        setMessageOpen(true);
                        title   = "저장 오류";
                        setLoading(false);
                        return;
                    }
                }

                const fileSaveResult = await fileRef.current.handleSave();
                if(fileSaveResult !== null && fileSaveResult !== undefined){
                    for(let i=0;i<fileSaveResult.length;i++){
                        fileSaveResult[i].UserCD = UserCD;
                    }
                    fileAr.DataSet = 'DataSet2';
                    fileAr.grid = fileSaveResult;
                    combinedData.push(fileAr);
                }

                combinedData.push(grid1Changes)

                // 신규 등록일 경우 비밀번호 지정해서 저장
                for(let i = 0; i< combinedData[0].grid.length; i++){
                    if(combinedData[0].grid[i].UserCD == null){
                        const cryptoPW = SHA256('1234').toString(); // 초기 비밀번호 설정
                        combinedData[0].grid[i].UserPW = cryptoPW
                    }
                }

                // 저장할 데이터 없을시 종료
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
                  
                    if(result){
                        let errMsg : any[] = [];

                        // SP 호출 결과 값 처리
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    errMsg.push({text: '시트 : 계정 관리 : '  + result[i][j].Message})
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


                        // 파일 저장 건이 있다면 결과 값 담기
                        if(fileSaveResult !== null){
                            try{
                                const conditionAr : any[] = [{UserCD : UserCD, DataSet : "DataSet1"}]
                                const result = await SP_Request("S_Admin_UserInfo_Sub_File_Query", conditionAr);
                                if(result.length > 0){
                                    // 결과값이 있을 경우 그리드에 뿌려주기
                                    setFileData(result[0]);
                                } 
                            } catch (error) {
                                // SP 호출 시 에러 처리 로직
                                console.log(error);
                            }                        
                        }

                        //시트 변경 내역 초기화
                        setGrid1Changes({ DataSet : '', grid: []});

                        // SP 결과 값이 있을 때 로직
                        errMsg = [];
                        errMsg.push({text: "저장 완료되었습니다."})
                        setMessageOpen(true);
                        message = errMsg;
                        title   = "저장 완료";
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        let errMsg : any[] = [];
                        errMsg.push({text: "저장할 데이터가 없습니다."})
                        setMessageOpen(true);
                        message = errMsg;
                        title   = "저장 실패";
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
                    // console.log(toolbar[clickID].spName);
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

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {

    }


    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgFormAdminUserInfo') === undefined) {
            setCondition1('');
            setCondition2('');
            setCondition3('');
            setGrid1Data([]);
            setGrid1Changes({DataSet : '', grid: []});
            setFileCD(0);
            setFileData([]);
            setRightClickUserName('');
            setIsRightClick(false);
        }
    }, [openTabs]);


    return (
        <>
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgFormAdminUserInfo' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"계정 조회 조건"}>
                    <FixedWrap>
                        <TextBox name={"이름"}     value={UserName} onChange={setCondition1}/>    
                        <TextBox name={"아이디"}   value={UserID}   onChange={setCondition2}/>   
                        <TextBox name={"전화번호"} value={TelNo}    onChange={setCondition3} />    
                        <Button name={"계정 초기화"} clickEvent={clickEvent}></Button>
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                <Splitter SplitType={"horizontal"} FirstSize={60} SecondSize={40}>
                    <div onContextMenu={rightClick1} style={{height:"100%"}}>
                        <Grid ref={grid1Ref} gridId="DataSet1" title = "계정 정보" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {true} onClick={gridClick}/>
                    </div>
                    <File openUrl={strOpenUrl} ref={fileRef} source={fileData} fileCD = {setFileCD} fileTitle= {RightClickUserName}/>
                </Splitter>
                </DynamicArea>
            </div>
        </>
    )
}

export default UserInfo;