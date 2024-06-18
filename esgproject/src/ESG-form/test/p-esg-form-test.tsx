import React, { useRef, useState, useEffect }  from 'react'
import '../../global.d.ts';


//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import Dialogue from '../../ESG-common/Dialogue/p-esg-common-dialogue.tsx';
import ToastEditor from '../../ESG-common/Editor/p-esg-common-Editor.tsx';
import EditorViewer from '../../ESG-common/Editor/p-esg-common-Editor-Viewer.tsx';
import GridTab from '../../ESG-common/GridTab/p-esg-common-GridTab.tsx';
import GridTabItem from '../../ESG-common/GridTab/p-esg-common-GridTabItem.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';


type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type editAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    condition1 : string;
    condition2 : string;
    condition3 : string;
    DataSet    : string;
}  

const Environmental = ({strOpenUrl, openTabs, setIsDataChanged}) => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 조회조건 값
    const [condition1, setCondition1] = useState('')
    const [condition2, setCondition2] = useState('')
    const [condition3, setCondition3] = useState('')

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes, setGrid2Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [edit1Changes, setEdit1Changes] = useState<editAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        setIsDataChanged(true);
        if (gridId === 'DataSet1') {
            setGrid1Changes(changes);
        } else if (gridId === 'DataSet2') {
            setGrid2Changes(changes);
        }
    };

    // 에디터 변경 감지
    const handleEditorChange = (editId : string , changes : editAr) => {
        setIsDataChanged(true);
        if(editId === 'DataSet3'){
            setEdit1Changes(changes);
        }
    }
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);

    // 에디터 Ref
    const Editor1Ref : any = useRef(null);

    // 에디터 뷰어 값
    const [EditText,setEditText] = useState('');

    // 다이얼로그 오픈
    const [isDlgOpen,setIsDlgOpen] = useState(false);
    

    const toolbar = [  
                       {id: 0, title:"신규", image:"new"  , spName:""}
                     , {id: 1, title:"조회", image:"query", spName:"S_Test"}
                     , {id: 2, title:"저장", image:"save" , spName:"S_Save_Test"}
                     , {id: 3, title:"삭제", image:"cut"  , spName:"S_Cut_Test"}
                     , {id: 4, title:"다이얼로그 테스트", image:"save"  , spName:""}
                    ]
    
    const columns1 = [
        {name : "id", header: "ID", width: 50},
        {name : "name", header: "Name", width: 100, editor: 'text'},
    ];

    const columns2 = [
        {name : "id", header: "ID", width: 50, editor: 'text', validation: {dataType: 'number'}},
        {name : "NickName", header: "NickName", width: 100, editor: 'text', align: 'center', },
        {name : "Searchbox", header: "Searchbox", width: 100, renderer: {type: 'searchbox',options: {searchCode: 2, CodeColName :"SearchboxCD"}}},
        {name : "SearchboxCD", header: "SearchboxCD", width: 100, },
        {name : "btnTest", header: "btnTest", width: 100, renderer: {type: 'button',options: {btnName: "button", clickFunc : (rowkey,colName) =>{ console.log(rowkey +"/"+colName)}}}},
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{

        switch (clickID){

            // 신규
            case 0 :
                console.log("시트 초기화");
                break;

            // 조회
            case 1 : 
                    // 조회 조건 담기
                    const conditionAr : condition = ({
                        condition1 : condition1,
                        condition2 : condition2,
                        condition3 : condition3,
                        DataSet    : 'DataSet1'
                    })

                    // 로딩 뷰 보이기
                    setLoading(true);
                    try {
                        // 조회 SP 호출 후 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result){
                            // 결과값이 있을 경우 그리드에 뿌려주기
                            setGrid1Data(result[0]);
                            setGrid2Data(result[1]);
                        } else{
                            // 결과값이 없을 경우 처리 로직
                            window.alert("ㄴ")
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
                // grid1Ref.current.setEditFinish();
                grid2Ref.current.setEditFinish();
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                combinedData.push(grid1Changes)
                combinedData.push(grid2Changes)
                combinedData.push(edit1Changes)

                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        console.log(result);

                        setEditText(result[2][0].text);

                        // 저장 성공 시 데이터 변화 감지 값 false로 변경시켜 화면 이동 시 메세지 박스 출력하지 않도록 함
                        setIsDataChanged(false);
                    } else{
                        // SP 호출 결과 없을 경우 처리 로직
                        window.alert("저장 실패")
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

                    console.log(checkedData);

                    setLoading(true);
                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            console.log(result);
                        } else{
                            // SP 결과 값이 없을 때 로직
                            window.alert("저장 실패")
                        }
                    } catch (error) {
                        // SP 호출 시 에러 처리
                        console.log(error);
                    }
                    setLoading(false);

                break;

            // 다이얼로그 
            case 4 :
                setIsDlgOpen(true);
                
                break;
        }
      
    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find(item => item.url === '/environmental') === undefined) {
            setCondition1('');
            setCondition2('');
            setCondition3('');
            setGrid1Data([]);
            setGrid2Data([]);
        }
    }, [openTabs]);



    // 화면
    // if(strOpenUrl === '/environmental')
    return(
        <>
            <div style={{height:"calc(100% - 170px)", display : strOpenUrl === '/environmental' ? "block" : "none"}}>
                <Loading loading={loading}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/>
                <FixedArea name={"테스트 이름"}>
                    <FixedWrap>
                        <TextBox name={"신은규"} isRequire={"true"} value={condition1} onChange={setCondition1}/>   
                        <TextBox name={"엉덩이"} value={condition2} onChange={setCondition2}/>    
                        <TextBox name={"쥐어 뜯을 거"} width={300} value={condition3} onChange={setCondition3}/>    
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                        <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                            <ToastEditor ref={Editor1Ref} editId="DataSet3" onChange={handleEditorChange}/>
                            {/* <Grid ref={grid1Ref} gridId="DataSet1" title = "제목" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/> */}
                            <EditorViewer contents={EditText}/>
                        </Splitter>
                        <GridTab>
                            <GridTabItem name={"제목 테스트"}>
                                <Grid ref={grid2Ref}  gridId="DataSet2" title = "제목 테스트" source = {grid2Data} columns = {columns2} onChange={handleGridChange} addRowBtn = {true}/>
                            </GridTabItem>
                            <GridTabItem name={"에디터 화면"}>
                                {/* <EditorViewer contents={EditText}/> */}
                                <Grid ref={grid1Ref} gridId="DataSet1" title = "제목" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
                            </GridTabItem>
                        </GridTab>
                    </Splitter>
                </DynamicArea>
                <Dialogue DlgName = "다이얼로그 테스트" isOpenDlg={isDlgOpen} setIsOpen={setIsDlgOpen} Dlgwidth={1200} Dlgheight={800}>
                    <Toolbar items={toolbar} clickID={toolbarEvent}/>
                    <FixedArea name={"테스트 이름"}>
                        <FixedWrap>
                            <TextBox name={"신은규"} isRequire={"true"} value={condition1} onChange={setCondition1}/>   
                            <TextBox name={"엉덩이"} value={condition2} onChange={setCondition2}/>    
                            <TextBox name={"쥐어 뜯을 거"} width={300} value={condition3} onChange={setCondition3}/>    
                        </FixedWrap>
                    </FixedArea>  
                    <DynamicArea>
                        <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                            <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                                <div>
                                    테스트 1
                                </div>
                                <Grid ref={grid1Ref} gridId="DataSet1" title = "제목" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
                            </Splitter>
                            <Grid ref={grid2Ref}  gridId="DataSet2" title = "제목 테스트" source = {grid2Data} columns = {columns2} onChange={handleGridChange} addRowBtn = {true}/>
                        </Splitter>
                    </DynamicArea>
                </Dialogue>
            </div>
        </>
    )

}

export default Environmental;