// 계정 관리

import React, { useRef, useState }  from 'react'
import '../../global.d.ts';
import {SHA256} from 'crypto-js';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';

import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    UserName   : string;
    UserID     : string;
    EMail      : string;
    DataSet    : string;
}  


const UserInfo = () => {

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 조회조건 값
    const [UserName, setCondition1] = useState('')
    const [UserID  , setCondition2] = useState('')
    const [EMail   , setCondition3] = useState('')

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes] = useState<gridAr>({ DataSet : '', grid: []});

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            grid1Changes = changes;
        } 
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);

    // 툴바 
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_ESG_Admin_UserInfo_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_ESG_Admin_UserInfo_Save"}
      , {id: 3, title:"삭제", image:"cut"  , spName:"S_ESG_Admin_UserInfo_Cut"}
     ]

     // 시트 컬럼 값
     const columns1 = [
        {name : "UserCD"  , header: "유저코드", width:  70, hidden: true},
        {name : "UserID"  , header: "아이디"  , width: 100, editor: 'text'},
        {name : "UserName", header: "이름"    , width: 100, editor: 'text'},
        {name : "Email"   , header: "이메일"  , width: 200, editor: 'text'},
        {name : "TelNo"   , header: "전화번호", width: 160, editor: 'text'},
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
                        UserName : UserName,
                        UserID   : UserID,
                        EMail    : EMail,
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
                        } else{
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
                
                // 시트 내 변동 값 담기
                let combinedData : any[] = [];
                combinedData.push(grid1Changes)
                // combinedData[0].grid.push({UserPW: cryptoPW})
                
                // 신규 등록일 경우 비밀번호 지정해서 저장
                for(let i = 0; i< combinedData[0].grid.length; i++){
                    if(combinedData[0].grid[i].UserCD == null){
                        const cryptoPW = SHA256('1234').toString();
                        combinedData[0].grid[i].UserPW = cryptoPW
                    }
                }

                setLoading(true);
                try {
                    const result = await SP_Request(toolbar[clickID].spName, combinedData);
                    
                    if(result){
                        // SP 호출 결과 값 처리
                        grid1Ref.current.setRowData(result);
                        window.alert("저장 완료되었습니다.")
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

                    setLoading(true);
                    try {
                        // SP 결과 값 담기
                        const result = await SP_Request(toolbar[clickID].spName, checkedData);
                        
                        if(result){
                            // SP 결과 값이 있을 때 로직
                            console.log(result);
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
            <FixedArea name={"계정 조회 조건"}>
                <FixedWrap>
                    <TextBox name={"이름"}   value={UserName} onChange={setCondition1}/>    
                    <TextBox name={"아이디"} value={UserID}   onChange={setCondition2}/>   
                    <TextBox name={"이메일"} value={EMail}    onChange={setCondition3} width={300}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Grid ref={grid1Ref} gridId="DataSet1" title = "계정 정보" source = {grid1Data} columns = {columns1} onChange={handleGridChange} addRowBtn = {true}/>
            </DynamicArea>
        </>
    )
}

export default UserInfo;