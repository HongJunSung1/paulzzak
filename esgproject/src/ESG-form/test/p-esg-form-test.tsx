import React, { useEffect, useRef, useState }  from 'react'
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

import { SP_Request } from '../../hooks/sp-request.tsx';

type ModifiedRows = {
    createdRows: any[];
    updatedRows: any[];
    deletedRows: any[];
  };

type grid1Ar = {
    DataSet    : string;
    grid       : any[];
  };

type grid2Ar = {
    DataSet   : string;
    grid      : any[];
  };

type condition = {
    condition1 : string;
    condition2 : string;
    condition3 : string;
    DataSet    : string;
}  

const Environmental: React.FC = () => {

    // 조회조건 값
    const [condition1, setCondition1] = useState('')
    const [condition2, setCondition2] = useState('')
    const [condition3, setCondition3] = useState('')

    // 그리드 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);
    let [grid1Changes] = useState<ModifiedRows>({ createdRows: [], updatedRows: [], deletedRows: []});
    let [grid2Changes] = useState<ModifiedRows>({ createdRows: [], updatedRows: [], deletedRows: []});
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);



    const handleGridChange = (gridId: string, changes: ModifiedRows) => {
        if (gridId === 'grid1') {
            grid1Changes = changes;
        } else if (gridId === 'grid2') {
            grid2Changes = changes;
        }
    };
    

    const toolbar = [  
                       {id: 0, title:"신규", image:"new"  , spName:""}
                     , {id: 1, title:"조회", image:"query", spName:"S_Test"}
                     , {id: 2, title:"저장", image:"save" , spName:"S_Save_Test"}
                     , {id: 3, title:"삭제", image:"cut"  , spName:"S_Cut_Test"}
                    ]

    const [loading,setLoading] = useState(false);
    
    const columns1 = [
        {name : "id", header: "ID", width: 50},
        {name : "name", header: "Name", width: 100, editor: 'text'},
    ];

    const columns2 = [
        {name : "id", header: "ID", width: 50, editor: 'text', validation: {dataType: 'number'}},
        {name : "NickName", header: "NickName", width: 100, editor: 'text', align: 'center'},
    ];

    // 툴바 이벤트
    const toolbarEvent = async (clickID) =>{

        switch (clickID){

            case 0 :
                console.log("시트 초기화");
                break;

            case 1 : 
                    const conditionAr : condition = ({
                        condition1 : condition1,
                        condition2 : condition2,
                        condition3 : condition3,
                        DataSet    : 'DataSet1'
                    })

                    setLoading(true);
                    try {
                        const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);
                        
                        if(result){
                            setGrid1Data(result[0]);
                            setGrid2Data(result[1]);
                        } else{
                            window.alert("ㄴ")
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    setLoading(false);


                break;

            case 2 : 
                let grid1Ar : any[] = [];
                let grid2Ar : any[] = [];

                grid1Ar.push(...grid1Changes.createdRows)
                grid1Ar.push(...grid1Changes.updatedRows)

                grid2Ar.push(...grid2Changes.createdRows)
                grid2Ar.push(...grid2Changes.updatedRows)

                for(let i in grid1Ar) delete grid1Ar[i]._attributes
                for(let i in grid2Ar) delete grid2Ar[i]._attributes

                

                const grid1ArChange : grid1Ar = ({
                    DataSet : 'DataSet1',
                    grid    : grid1Ar
                })

                const grid2ArChange : grid2Ar = ({
                    DataSet : 'DataSet2',
                    grid    : grid2Ar
                })


                let combinedData : any[] = [];

                combinedData.push(grid1ArChange)
                combinedData.push(grid2ArChange)

                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        console.log(result);
                    } else{
                        window.alert("저장 실패")
                    }
                } catch (error) {
                    console.log(error);
                }
                setLoading(false);


                break;

            case 3 :

                    let gridcheck1 : any[] = [];
                    let gridcheck2 : any[] = [];
    
                    gridcheck1.push(...grid1Ref.current.getCheckedRows());
                    gridcheck2.push(...grid2Ref.current.getCheckedRows());
    
                    // for (let key in A) {
                    //     if (A.hasOwnProperty(key) && !B.hasOwnProperty(key)) {
                    //         delete A[key];
                    //     }
                    // }
                    for(let i in gridcheck1){
                        delete gridcheck1[i].rowSpanMap;
                        delete gridcheck1[i].uniqueKey;
                        delete gridcheck1[i].sortKey;
                        delete gridcheck1[i]._attributes;
                        delete gridcheck1[i]._disabledPriority;
                        delete gridcheck1[i]._relationListItemMap;
                    }

                    for(let i in gridcheck2){
                        delete gridcheck2[i].rowSpanMap;
                        delete gridcheck2[i].uniqueKey;
                        delete gridcheck2[i].sortKey;
                        delete gridcheck2[i]._attributes;
                        delete gridcheck2[i]._disabledPriority;
                        delete gridcheck2[i]._relationListItemMap;
                    }
                    
    
                    const grid1ArCheck : grid1Ar = ({
                        DataSet : 'DataSet1',
                        grid    : gridcheck1
                    })
    
                    const grid2ArCheck : grid2Ar = ({
                        DataSet : 'DataSet2',
                        grid    : gridcheck2
                    })
    
                    let checkedData : any[] = [];
    
                    checkedData.push(grid1ArCheck);
                    checkedData.push(grid2ArCheck);

                    setLoading(true);
                    try {
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            console.log(result);
                        } else{
                            window.alert("저장 실패")
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    setLoading(false);

                break;
        }
      
    }

    // 소스 결과 값 전달
    // const resData = (resData) => {
    //     // for(let i = 0; i < Object.keys(resData[0]).length; i++){
    //     //     resData[0][i].DataSet = 'DataSet1';
    //     // }
        
    //     // for(let i = 0; i < Object.keys(resData[1]).length; i++){
    //     //     resData[1][i].DataSet = 'DataSet2';
    //     // }

    //     setGrid1Data(grid1Data);
    //     setGrid2Data(grid2Data);
    // };


    return(
        <>
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
                        <div>
                            테스트 1
                        </div>
                        <Grid ref={grid1Ref} gridId="grid1" title = "제목" source = {grid1Data} columns = {columns1} onChange={handleGridChange}/>
                    </Splitter>
                    <Grid ref={grid2Ref}  gridId="grid2" title = "제목 테스트" source = {grid2Data} columns = {columns2} onChange={handleGridChange}/>
                </Splitter>
            </DynamicArea>
        </>
    )

}

export default Environmental;