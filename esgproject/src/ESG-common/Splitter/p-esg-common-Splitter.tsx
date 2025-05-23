import React from 'react'
import '../../global.d.ts';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import './p-esg-common-Splitter.css';

const Split = ({children, SplitType, FirstSize, SecondSize}) => {
    const contentsArray = React.Children.toArray(children);

    const firstContent = contentsArray[0]; //스플리터 안 첫번째 요소
    const secondContent = contentsArray[1]; // 스플리터 안 두번째 요소

    return (
    <Splitter style={{height: "100%", width: "100%"}} className="mb-5" layout={SplitType} >
        <SplitterPanel className="flex align-items-center justify-content-center" size={FirstSize}>
            {firstContent}
        </SplitterPanel>
        <SplitterPanel className="flex align-items-center justify-content-center" size={SecondSize}>
            {secondContent}
        </SplitterPanel>
    </Splitter>
    )
} 

export default Split;