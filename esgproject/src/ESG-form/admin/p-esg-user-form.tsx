//사용자별 화면 권한
import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    UserName   : string;
    DataSet    : string;
}  

type condition2 = {
    FormName : string;
    UserCD   : number;
    DataSet  : string;
}

// 메시지 박스
let message : any     = [];
let title   : string  = "";

// 우클릭 조회 시 받는 내부코드 값
let UserCD = 0

const UserForm = ({strOpenUrl, openTabs}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [UserName , setCondition1] = useState('');
    const [FormName , setCondition2] = useState('');

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid2Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if(gridId === 'DataSet2'){
            grid2Changes = changes;
        }
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_User_Form_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_User_Form_Save"}
     ]

     // 시트 컬럼 값
     const columns1 = [
        {name : "UserCD"    , header: "사용자코드"     , width:  70 , hidden: true},
        {name : "UserName"  , header: "사용자명"       , width: 200},
        {name : "UserID"    , header: "사용자 아이디"  , width: 200},
    ];

    const columns2 = [
        {name : "FormCD"    , header: "화면 코드"     , width:  70, hidden: true},
        {name : "IsAuth"    , header: "권한여부"      , width: 70, renderer: { type: 'checkbox' }},
        {name : "FormName"  , header: "화면명"       , width: 400}
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch (clickID){
            // 신규
            case 0 :
                grid1Ref.current.clear();
                grid2Ref.current.clear();
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        UserName : UserName,
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
                            grid2Ref.current.clear();
                        }else{
                            // 결과값이 없을 경우 처리 로직
                            window.alert("조회 결과가 없습니다.")
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
                grid2Ref.current.setEditFinish();

                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid2Changes.grid = grid2Ref.current.setColumCheck(grid2Changes.grid);
                
                for(let i in grid2Changes.grid){
                    grid2Changes.grid[i].UserCD = UserCD;
                }

                combinedData.push(grid2Changes);

                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length === 0){
                    window.alert('저장할 데이터가 없습니다.');
                    setLoading(false);
                    return;
                }

                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        let errMsg : any[] = [];
                        // SP 호출 결과 값 처리
                        for(let i in result){
                            for(let j in result[i]){
                                if(result[i][j].Status > 0){
                                    errMsg.push({text: "시트: 화면 정보 " + result[i][j].Message})
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
                        grid2Ref.current.setRowData(result[0]);
                        window.alert("저장 완료")
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        window.alert("저장 에러")
                    }
                } catch (error) {
                    // SP 호출 시 에러 처리
                    console.log(error);
                }
                setLoading(false);

                break;
        }
      
    }

    // 우클릭 시 조회
    const rightClick1 = (event: React.MouseEvent) => {
        event.preventDefault();  // 기본 우클릭 메뉴 비활성화
        setTimeout(async ()=> {
            UserCD = 0
            grid2Ref.current.clear();

            if(grid1Ref.current.rightClick() !== null){
                UserCD = grid1Ref.current.rightClick().UserCD
            }     

            // 조회 조건 담기
            const condition2Ar : condition2 = ({
                FormName : FormName,
                UserCD   : UserCD,
                DataSet  : 'DataSet1'
            })

            if(UserCD > 0){
                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request("S_ESG_User_Form_SubQuery", [condition2Ar]);
                    if(result.length > 0){
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        setGrid2Data(result[0]);
                    } else{
                        // 결과값이 없을 경우 처리 로직
                        window.alert("조회 결과가 없습니다.");
                        grid2Ref.current.clear();
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

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/PEsgUserForm') === undefined) {
            setCondition1('');
            setCondition2('');
            setGrid1Data([]);
            setGrid2Data([]);
        }
    }, [openTabs]);

    if(strOpenUrl === '/PEsgUserForm')
    return (
        <>
            <Loading loading={loading}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <Toolbar items={toolbar} clickID={toolbarEvent}/>
            <FixedArea name={"조회 조건"}>
                <FixedWrap>
                    <SearchBox name={"사용자명"} value={UserName}  onChange={setCondition1} width={200} searchCode={2}/>
                    <TextBox   name={"화면명"}   value={FormName}  onChange={setCondition2} width={200}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Splitter SplitType={"horizontal"} FirstSize={40} SecondSize={60}>
                    <div onContextMenu={rightClick1} style={{height:"100%"}}>
                        <Grid ref={grid1Ref} gridId="DataSet1" title = "사용자 정보" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {false}/>
                    </div>
                    <Grid ref={grid2Ref} gridId="DataSet2" title = "화면 정보"   source = {grid2Data} columns = {columns2} onChange={handleGridChange} addRowBtn = {true}/>
                </Splitter>
            </DynamicArea>
        </>
    )
}

export default UserForm;