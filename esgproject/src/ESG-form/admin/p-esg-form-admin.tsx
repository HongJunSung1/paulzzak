// 계정 관리

import React, { useState }  from 'react'
import '../../global.d.ts';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';

const Admin = () => {

    // 툴바
    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_UserInfo_Query"}
      , {id: 2, title:"저장", image:"save" , spName:"S_Save_Test"}
      , {id: 3, title:"삭제", image:"cut"  , spName:""}
     ]

     // 컬럼
     const [loading,setLoading] = useState(false);
     const [source1,setSource1] = useState<object>([]);

     const columns1 = [
        {name : "UserCD"  , header: "유저코드", width:  70, hidden: true},
        {name : "UserID"  , header: "아이디"  , width: 100},
        {name : "UserName", header: "이름"    , width: 100, editor: 'text'},
        {name : "Email"   , header: "이메일"  , width: 200, editor: 'text'},
        {name : "TelNo"   , header: "전화번호", width: 160, editor: 'text'},
    ];

    // 로딩 뷰
    const isLoading = (isLoad) => {
        setLoading(isLoad);
    }

    // 소스 결과 값 전달
    const resData = (resData) => {
        setSource1(resData[0]);
    }

    return (
        <>
            <Loading loading={loading}/>
            <Toolbar items={toolbar} resData={resData} isLoading={isLoading}/>
            <FixedArea name={"계정 조회 조건"}>
                <FixedWrap>
                    <TextBox name={"이름"}/>    
                    <TextBox name={"아이디"}/>   
                    <TextBox name={"이메일"} width={300}/>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                test
                {/* <Grid title="계정 정보" source = {source1} columns={columns1}/> */}
            </DynamicArea>
        </>
    )
}

export default Admin;