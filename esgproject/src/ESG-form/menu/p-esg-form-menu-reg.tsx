// 메뉴 등록
import React, { useRef, useState }  from 'react'
import '../../global.d.ts';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

const Menu: React.FC = () => {
    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);
    const [grid3Data, setGrid3Data] = useState([]);

    // 우클릭 시 조회
    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();  // 기본 우클릭 메뉴 비활성화
        setTimeout(()=> {
            const abc = grid1Ref.current.rightClick()
            console.log(abc.LMenuCD)
        }, 100)
    };

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid3Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            grid1Changes = changes;
        } else if (gridId === 'DataSet2') {
            grid2Changes = changes;
        } else if (gridId === 'DataSet3') {
            grid3Changes = changes;
        }
    };


    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);    
    const grid3Ref : any = useRef(null);    

    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_Menu_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_Menu_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_Menu_Cut"}
     ]

     const columns1 = [
        {name : "LMenuCD"  , header: "내부코드"   , width:  70, hidden: true },
        {name : "LMenuName", header: "대메뉴 이름", width: 250, editor: 'text'},
        {name : "LOrder"   , header: "순서"       , width: 40, editor: 'text'},
    ];
    
    const columns2 = [
        {name : "MMenuCD"  , header: "내부코드"   , width:  70, hidden: true},
        {name : "MMenuName", header: "중메뉴 이름", width: 250, editor: 'text'},
        {name : "MOrder"   , header: "순서"       , width: 40, editor: 'text'},
    ];

    const columns3 = [
        {name : "SMenuCD"  , header: "내부코드"   , width:  70, hidden: true},
        {name : "SMenuName", header: "소메뉴 이름", width: 250, editor: 'text'},
        {name : "SOrder"   , header: "순서"       , width: 40, editor: 'text'},
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{
        switch(clickID){
            // 신규
            case 0:
                grid1Ref.current.clear();
                grid2Ref.current.clear();
                grid3Ref.current.clear();
                break;

            // 조회
            case 1: 
                grid1Ref.current.clear();
                grid2Ref.current.clear();
                grid3Ref.current.clear();

                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, []);
                    
                    if(result[0].length > 0){
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        // 조회 버튼으로는 대메뉴 조회만 나와야 하기 때문에 result[0]만 뿌려줌
                        setGrid1Data(result[0]);
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
                grid1Ref.current.setEditFinish();
                grid2Ref.current.setEditFinish();
                grid3Ref.current.setEditFinish();
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];

                //모든 컬럼이 빈값인지 체크
                grid1Changes.grid = grid1Ref.current.setColumCheck(grid1Changes.grid);
                grid2Changes.grid = grid2Ref.current.setColumCheck(grid2Changes.grid);
                grid3Changes.grid = grid3Ref.current.setColumCheck(grid3Changes.grid);
                
                combinedData.push(grid1Changes)
                combinedData.push(grid2Changes)
                combinedData.push(grid3Changes)

                // 저장할 데이터 없을시 종료
                if(combinedData[0].grid.length + combinedData[1].grid.length + combinedData[2].grid.length === 0){
                    window.alert('저장할 데이터가 없습니다.');
                    setLoading(false);
                    return;
                } 

                // 중분류 우클릭 조회 없이 저장하면 리턴
                for(let i = 0 ; i < grid2Changes.grid.length ; i++){
                    if(grid2Changes.grid[i].LMenuCD === null || grid2Changes.grid[i].LMenuCD === undefined){
                        window.alert('대분류 등록 후 중분류 메뉴 저장 가능합니다.')
                        setLoading(false);
                        return;
                    }
                }

                // 소분류 우클릭 조회 없이 저장하면 리턴
                for(let i = 0 ; i < grid3Changes.grid.length ; i++){
                    if(grid3Changes.grid[i].MMenuCD === null || grid3Changes.grid[i].MMenuCD === undefined){
                        window.alert('중분류 등록 후 소분류 메뉴 저장 가능합니다.')
                        setLoading(false);
                        return;
                    }
                }

                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        grid1Ref.current.setRowData(result[0]);
                        grid2Ref.current.setRowData(result[1]);
                        grid3Ref.current.setRowData(result[2]);
                        window.alert("저장 완료")
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
                    setLoading(true);
                    // 체크한 데이터 담기 
                    let checkedData : any[] = [];

                    checkedData.push(grid1Ref.current.getCheckedRows());
                    checkedData.push(grid2Ref.current.getCheckedRows());
                    checkedData.push(grid3Ref.current.getCheckedRows());

                    // 삭제할 데이터 없을시 종료
                    if(checkedData[0].grid.length === 0){
                        window.alert('삭제할 데이터가 없습니다.');
                        setLoading(false);
                        return;
                    }

                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            grid1Ref.current.removeRows(result[0]);
                            grid2Ref.current.removeRows(result[1]);
                            grid3Ref.current.removeRows(result[2]);
                            window.alert("삭제 완료")
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
        }
    
    } 

    return (
        <>
            <Loading loading={loading}/>
            <Toolbar items={toolbar} clickID={toolbarEvent}/>
            <DynamicArea>
                <div onContextMenu={handleContextMenu} style={{height:"100%"}}>
                <Splitter SplitType={"horizontal"} FirstSize={33} SecondSize={67}>
                    <Grid ref={grid1Ref} gridId="DataSet1" title = "대메뉴" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
                    <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                        <Grid ref={grid2Ref} gridId="DataSet2" title = "중메뉴" source = {grid2Data} columns = {columns2} onChange={handleGridChange} addRowBtn = {true}/>
                        <Grid ref={grid3Ref} gridId="DataSet3" title = "소메뉴" source = {grid3Data} columns = {columns3} onChange={handleGridChange} addRowBtn = {true}/>
                    </Splitter>
                </Splitter>
                </div>
            </DynamicArea>
        </>
    )


}

export default Menu;