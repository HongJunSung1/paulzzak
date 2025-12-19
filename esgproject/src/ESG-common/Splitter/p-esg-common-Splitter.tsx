import React from 'react'
import '../../global.d.ts';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import './p-esg-common-Splitter.css';

type FormSplitProps = {
  children: any;
  SplitType: any;
  FirstSize: any;
  SecondSize: any;
};

const Split = ({children, SplitType, FirstSize, SecondSize}: FormSplitProps) => {
    const contentsArray = React.Children.toArray(children);

    const firstContent = contentsArray[0]; //스플리터 안 첫번째 요소
    const secondContent = contentsArray[1]; // 스플리터 안 두번째 요소

    return (
    <Splitter style={{height: "100%", width: "100%"}} 
              className="mb-5 com-splitter" 
              layout={SplitType} 
              onResizeEnd={() => window.dispatchEvent(new Event('resize'))} // Grid가 resize를 감지하도록 트리거
    > 
        {/* <SplitterPanel className="flex align-items-center justify-content-center" size={FirstSize}> */}
        <SplitterPanel className="com-splitter-panel" size={FirstSize}>
            <div className="com-panel-fill">{firstContent}</div>
        </SplitterPanel>
        {/* <SplitterPanel className="flex align-items-center justify-content-center" size={SecondSize}> */}
        <SplitterPanel className="com-splitter-panel" size={SecondSize}>
            <div className="com-panel-fill">{secondContent}</div>
        </SplitterPanel>
    </Splitter>
    )
} 

export default Split;