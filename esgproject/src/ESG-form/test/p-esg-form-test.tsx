import React from 'react'
import '../../global.d.ts';
import { useState } from 'react';

import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";

//공통 소스
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import TextBox from "../../ESG-common/TextBox/p-esg-common-TextBox.tsx";

import { SP_Request } from '../../hooks/sp-request.tsx';



const Environmental = () => {

    const toolbar = [  
                       {id: 0, title:"신규", image:"new"  , sp:""}
                     , {id: 1, title:"조회", image:"query", sp:""}
                     , {id: 2, title:"저장", image:"save" , sp:""}
                     , {id: 3, title:"삭제", image:"cut"  , sp:""}
                    ]

    const [data,setData] = useState(null);

    const fetchData = async () => {
        try {
            const result = await SP_Request('S_Test', [{ data: '신은규' },{data : '홍준성'}]);
            setData(result);
        } catch (error) {
            setData(error);
        }
    };

    return(
        <>
            <Toolbar items={toolbar}/>
            <FixedArea name={"테스트 이름"}>
                <FixedWrap>
                    <TextBox name={"신은규"} isRequire={"true"}/>   
                    <TextBox name={"엉덩이"}/>    
                    <TextBox name={"쥐어 뜯을 거"} width={300}/>    
                </FixedWrap>
                <FixedWrap>
                    <TextBox></TextBox>    
                    <TextBox></TextBox>    
                </FixedWrap>
            </FixedArea>  
            <DynamicArea>
                <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                    <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                    <div>
                        <button onClick={fetchData}>버튼 테스트</button>
                        <div>{data && typeof data === 'object' ? JSON.stringify(data) : data}</div>
                    </div>
                    <div>테스트2</div>
                    </Splitter>
                    <div>테스트 3</div>
                </Splitter>
            </DynamicArea>
        </>
    )
}

export default Environmental;