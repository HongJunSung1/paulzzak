import React, {useEffect, useRef, useState} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-grid.module.css';

import 'tui-grid/dist/tui-grid.css';
import Grid from '@toast-ui/react-grid';

type CustomGridProps = {
    title: string;
    source: any[];
    columns: any[];

    onChange: (gridId: string, changes: ModifiedRows) => void;
    gridId: string;
    DataSet: string;
  };
  
type ModifiedRows = {
    createdRows: any[];
    updatedRows: any[];
    deletedRows: any[];
    DataSet    : string;
};

const ToastGrid: React.FC<CustomGridProps> =({title, source, columns, onChange, gridId, DataSet}) => {

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

    const activeEnter = (e) => {
        if(e.key === "Enter") {
            handleAppendRows();
        }
    }


    // // 데이터 가져오기
    // const dataModified = () => {
    //     if(gridRef.current){
    //         let gridAr : object[] = [];
    //         let createdAr : object[] | undefined = [];
    //         let updatedAr : object[] | undefined = [];

    //         let createArCnt : number = gridRef.current.getInstance().getModifiedRows({withRawData: true}).createdRows!.length;
    //         let updatedArCnt : number = gridRef.current.getInstance().getModifiedRows({withRawData: true}).updatedRows!.length;

    //         if(createArCnt > 0 ){ createdAr.push(gridRef.current.getInstance().getModifiedRows({withRawData: true}).createdRows!); }
    //         if(updatedArCnt > 0){ updatedAr.push(gridRef.current.getInstance().getModifiedRows({withRawData: true}).updatedRows!); }


    //         if(createdAr.length > 0){gridAr.push(createdAr);}
    //         if(updatedAr.length > 0){gridAr.push(updatedAr);}

    //         console.log(gridAr);
    //     }
    // }

    // const handleDataChange = useCallback(() => {
    //     const instance = gridRef.current?.getInstance();
    //     console.log(instance);
    //     if (instance) {
    //       const modifiedRows = instance.getModifiedRows();
    //       const changes: ModifiedRows = {
    //         createdRows: modifiedRows.createdRows ?? [],
    //         updatedRows: modifiedRows.updatedRows ?? [],
    //         deletedRows: modifiedRows.deletedRows ?? [],
    //       };
    //       console.log(`Grid ${gridId} detected changes:`, changes);
    //       onChange(gridId, changes);
    //     }
    //   }, [gridId, onChange]);
    

    //   useEffect(() => {
    //     const instance = gridRef.current?.getInstance();
    //     instance?.on('editingFinish', handleDataChange);
    
    //     return () => {
    //       instance?.off('editingFinish', handleDataChange);
    //     };
    //   }, []);


    gridRef.current?.getInstance().on('afterChange', () => {
        const modifiedRows = gridRef.current?.getInstance().getModifiedRows();
        const changes: ModifiedRows = {
          createdRows: modifiedRows?.createdRows ?? [],
          updatedRows: modifiedRows?.updatedRows ?? [],
          deletedRows: modifiedRows?.deletedRows ?? [],
          DataSet : DataSet
        };
        // console.log(`Grid ${gridId} detected changes:`, changes);
        onChange(gridId, changes);
    })

    return (
        <div className={styles.GridWrap}>
            <div className = {styles.GridStatus}>
                <div className={styles.AppendRowContainer}>
                    <button onClick={clickRowAppend} className={styles.GridBtn}>행 추가</button>
                    {isClickRowAppend &&   
                        <div className={styles.AppendRowWrap}>
                            <span className={styles.AppendUnit}>
                                <input type= "number" className={styles.AppendRowInput} onChange={changeNumber} value={setNumber} onKeyDown={(e) => activeEnter(e)}></input>
                                <button onClick={handleAppendRows} className={styles.GridBtn}>행 추가</button>
                            </span>
                        </div>
                    }
                </div>
                {/* <button onClick={dataModified} className={styles.GridBtn}>변동 확인</button> */}
                <div className = {styles.GridTitle}>{title}</div>
            </div>
            <div className={styles.GridWrap}>  
                {!isInitialized&&<div>로딩중..</div>}
                {isInitialized &&        
                <Grid   ref = {gridRef}
                        data={source}
                        editingEvent={'click'}
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