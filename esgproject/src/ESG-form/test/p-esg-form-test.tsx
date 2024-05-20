import React from 'react'
import '../../global.d.ts';

import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";


const Environmental = () => {

    const toolbar = [  
                       {id: 0, title:"신규", image:"new"  , sp:""}
                     , {id: 1, title:"조회", image:"query", sp:""}
                     , {id: 2, title:"저장", image:"save" , sp:""}
                     , {id: 3, title:"삭제", image:"cut"  , sp:""}
                    ]

    return(
        <>
            <Toolbar items={toolbar}/>
            <FixedArea name={"테스트 이름"}></FixedArea>  
            <DynamicArea>
            <Splitter SplitType={"horizontal"} FirstSize={50} SecondSize={50}>
                <Splitter SplitType={"vertical"} FirstSize={30} SecondSize={70}>
                <div>테스트1</div>
                <div>테스트2</div>
                </Splitter>
                <div>테스트 3</div>
            </Splitter>
            </DynamicArea>
        </>
    )
}

export default Environmental;