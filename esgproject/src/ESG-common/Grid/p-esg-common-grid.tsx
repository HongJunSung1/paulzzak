import React, {useEffect, useRef, useState} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-grid.module.css';

import 'tui-grid/dist/tui-grid.css';
import Grid from '@toast-ui/react-grid';

const ToastGrid = ({title, source, columns}) => {

    const gridRef = useRef<Grid | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isClickRowAppend, setCollapsed] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(()=> {
            setIsInitialized(true);
            if(gridRef.current){
                gridRef.current.getInstance().refreshLayout();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // 행 추가 화면 나타내기
    function clickRowAppend(){
        setCollapsed(prevValue => !prevValue);
    }

    // 행 추가 개수 구하기
    const[setNumber, setText] = useState('');

    const changeNumber = (e) => {
        setText(e.target.value);        
    }

    const handleAppendRows = () => {
        if(gridRef.current){
            for(let i = 0; i<parseInt(setNumber); i++){
                gridRef.current.getInstance().appendRow();
            }
        }
        clickRowAppend();
        setText('0');
    }


    // 데이터 가져오기
    const dataModified = () => {
        if(gridRef.current){
            let gridAr : object[] = [];
            let createdAr : object[] | undefined = [];
            let updatedAr : object[] | undefined = [];

            let createArCnt : number = gridRef.current.getInstance().getModifiedRows({withRawData: true}).createdRows!.length;
            let updatedArCnt : number = gridRef.current.getInstance().getModifiedRows({withRawData: true}).updatedRows!.length;

            if(createArCnt > 0 ){ createdAr.push(gridRef.current.getInstance().getModifiedRows({withRawData: true}).createdRows!); }
            if(updatedArCnt > 0){ updatedAr.push(gridRef.current.getInstance().getModifiedRows({withRawData: true}).updatedRows!); }

            if(createdAr.length > 0){gridAr.push(createdAr);}
            if(updatedAr.length > 0){gridAr.push(updatedAr);}

            console.log(gridAr);
        }
    }
    
    return (
        <div className={styles.GridWrap}>
            <div className = {styles.GridStatus}>
                <div className={styles.AppendRowContainer}>
                    <button onClick={clickRowAppend} className={styles.GridBtn}>행 추가</button>
                    {isClickRowAppend &&   
                        <div className={styles.AppendRowWrap}>
                            <span className={styles.AppendUnit}>
                                <input type= "number" className={styles.AppendRowInput} onChange={changeNumber} value={setNumber}></input>
                                <button onClick={handleAppendRows} className={styles.GridBtn}>행 추가</button>
                            </span>
                        </div>
                    }
                </div>
                <button onClick={dataModified} className={styles.GridBtn}>변동 확인</button>
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