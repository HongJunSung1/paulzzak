import React, {useEffect, useRef, useState} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-grid.module.css';

import 'tui-grid/dist/tui-grid.css';
import Grid from '@toast-ui/react-grid';

const ToastGrid = ({title, source, columns}) => {

    const gridRef = useRef<Grid | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const timer = setTimeout(()=> {
            setIsInitialized(true);
            if(gridRef.current){
                gridRef.current.getInstance().refreshLayout();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);
    

    const handleAppendRow = () => {
        if(gridRef.current){
            gridRef.current.getInstance().appendRow();
        }
    }
    
    return (
        <div className={styles.GridWrap}>
            <div className = {styles.GridStatus}>
                <button onClick={handleAppendRow} className={styles.GridBtn}>행 추가</button>
                <div className = {styles.GridTitle}>{title}</div>
            </div>
            <div className={styles.GridWrap}>  
                {!isInitialized&&<div>로딩중..</div>}
                {isInitialized &&           
                <Grid   ref = {gridRef}
                        data={source}
                        columns = {columns} 
                        bodyHeight={'fitToParent'}
                        rowHeight={25}
                        heightResizable={false} //테이블의 사이즈를 자동으로 조절
                        rowHeaders={[{type:"rowNum", align: 'center'}, {type:'checkbox'}]}
                    />
                }
            </div>
        </div>
    )   
}

export default ToastGrid;