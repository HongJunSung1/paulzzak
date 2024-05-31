import React, {useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-grid.module.css';

import 'tui-grid/dist/tui-grid.css';
import Grid from '@toast-ui/react-grid';

type CustomGridProps = {
    title: string;
    source: any[];
    columns: any[];
    onChange: (gridId: string, changes: gridAr) => void;
    gridId: string;
    addRowBtn: boolean;
  };
  
type ModifiedRows = {
    createdRows: any[];
    updatedRows: any[];
    deletedRows: any[];
};

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

const ToastGrid = forwardRef(({title, source, columns, onChange, gridId, addRowBtn}: CustomGridProps, ref) => {

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


    // 체크된 행 가져오기
    useImperativeHandle(ref , () => ({
        getCheckedRows : () => {
            if (gridRef.current) {
                // 삭제 시킬 행의 정보를 가져와 필요없는 정보를 배열에서 삭제하고 필요한 정보만 DataSet 값으로 넘긴 후 전달
                let gridcheck : any[] = [];

                gridcheck.push(...gridRef.current.getInstance().getCheckedRows());

                for(let i in gridcheck){
                    delete gridcheck[i].rowSpanMap;
                    delete gridcheck[i].uniqueKey;
                    delete gridcheck[i].sortKey;
                    delete gridcheck[i]._attributes;
                    delete gridcheck[i]._disabledPriority;
                    delete gridcheck[i]._relationListItemMap;
                }

                const gridArCheck : gridAr = ({
                    DataSet : gridId,
                    grid    : gridcheck
                })
                return gridArCheck
            }
            return [];
        },
    }));


    // 시트 수정 데이터 감지
    gridRef.current?.getInstance().on('afterChange', () => {
        const modifiedRows = gridRef.current?.getInstance().getModifiedRows();
        const changes: ModifiedRows = {
          createdRows: modifiedRows?.createdRows ?? [],
          updatedRows: modifiedRows?.updatedRows ?? [],
          deletedRows: modifiedRows?.deletedRows ?? [],
        };
        
        let gridAr : any[] = [];
        
        gridAr.push(...changes.createdRows);
        gridAr.push(...changes.updatedRows);


        for(let i in gridAr) delete gridAr[i]._attributes
        

        const gridArChange : gridAr = ({
            DataSet : gridId,
            grid    : gridAr
        })

        onChange(gridId, gridArChange);
    })

    return (
        <div className={styles.GridWrap}>
            <div className = {styles.GridStatus}>
                <div className={styles.AppendRowContainer}>
                    {addRowBtn && <button onClick={clickRowAppend} className={styles.GridBtn}>행 추가</button>}
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
                        rowHeight={30}
                        minRowHeight={30}
                        heightResizable={false} //테이블의 사이즈를 자동으로 조절
                        rowHeaders={[{type:"rowNum", align: 'center'}, {type:'checkbox'}]}
                    />
                }
            </div>
        </div>
    )   
}
)

export default ToastGrid;