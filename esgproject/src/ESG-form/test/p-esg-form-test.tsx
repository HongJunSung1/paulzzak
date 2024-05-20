import React from 'react'
import '../../global.d.ts';
import { useState } from 'react';

//공통 소스
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";

import { SP_Request } from '../../hooks/sp-request.tsx';



const Environmental = () => {


    const [data,setData] = useState(null);

    const fetchData = async () => {
        try {
            const result = await SP_Request('https://example.com/api', [{ key: 'value' }]);
            setData(result);
        } catch (error) {
            setData(error);
        }
    };

    return(
        <>
            <FixedArea name={"테스트 이름"}></FixedArea>  
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