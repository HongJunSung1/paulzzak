//scope3
import React, { useRef, useState, useEffect}  from 'react'

//공통 소스
import Toolbar from "../../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import TextBox from "../../../ESG-common/TextBox/p-esg-common-TextBox.tsx";
import Loading from '../../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../../ESG-common/Grid/p-esg-common-grid.tsx';
import Splitter from "../../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import MessageBox from '../../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../../hooks/sp-request.tsx';

const Scope3 = ({strOpenUrl, openTabs, setIsDataChanged}) => {
    return (
        <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PEsgEnvScope3' ? "flex" : "none", flexDirection:"column"}}>
            <div>Scope3</div>
        </div>
    )
}

export default Scope3;