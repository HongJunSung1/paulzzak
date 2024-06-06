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

    // 우클릭 조회 담기 용
    let rightClickValue : any = []     
    let rowAllValue : any = []; 

    // 엔터키 방지용
    let keyDownCellValue : any = [];

    useEffect(() => {
        // setIsInitialized(false);
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


    //커스텀 렌더러 설정

    // 1. 체크박스
    class CheckBox {
        el: HTMLInputElement;
        grid: any;
        rowKey: any;
        columnName: any;
      
        constructor(props) {
          const el = document.createElement('input');
          el.type = 'checkbox';
      
          el.style.display = 'block';
          el.style.margin = 'auto';
          el.style.position = 'relative';
          el.style.top = '50%';
      
          this.el = el;
          this.grid = props.grid;
          this.rowKey = props.rowKey;
          this.columnName = props.columnInfo.name;
      
          this.render(props);
      
          // 이벤트 리스너 추가
          this.el.addEventListener('change', this.onChange.bind(this));
        }
      
        getElement() {
          return this.el;
        }
      
        render(props) {
            const value = String(props.value);
            this.el.checked = value === '1';
            this.el.disabled = props.columnInfo.renderer.options?.disabled || false;
          }
      
        onChange(event) {
          const newValue = event.target.checked ? '1' : '0';
          this.grid.dispatch('setValue', this.rowKey, this.columnName, newValue);
        }
      }

    // 설정에 따른 커스텀 렌더러로 변경
    columns.forEach(column => {
        if (column.renderer && column.renderer.type === 'checkbox') {
            column.renderer = {
                type: CheckBox,
                options: {
                  disabled: column.disabled || false
                }
            };
        }
    });

    // 공통 함수
    useImperativeHandle(ref , () => ({

        // 체크된 행 가져오기
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

        // 저장 후 시트 값 뿌려주기
        setRowData : (rowData) => {
            if(gridRef.current){
                // setRows는 저장 후 시트 변경이 안되어 serRow 반복으로 변경
                for(let i in rowData){
                    gridRef.current.getInstance().setRow(Number(rowData[i].rowKey), rowData[i]);
                }
            } 
        },

        // 저장 전 모든 컬럼 빈값 데이터 삭제
        setColumCheck : (gridData) =>{
            //시트 컬럼명
            const columnNames = columns.map(column => column.name);
            if(gridRef.current){
                const NoDataList = gridData.filter(row => isRowEmpty(row, columnNames));

                //삭제할 키 값
                const cutData = NoDataList.map(key => key.rowKey);

                //시트 해당 행 삭제
                gridRef.current.getInstance().removeRows(cutData);

                //반환 결과
                const returnData = gridData.filter(aItem => !NoDataList.some(bItem => bItem.rowKey === aItem.rowKey));

                return returnData;
            } 
            return [];
        },

        // 저장시 시트 입력 종료
        setEditFinish : () =>{
            if(gridRef.current){
                gridRef.current.getInstance().finishEditing();
            } 
        },

        //시트 데이터 삭제 후 시트 행 삭제
        removeRows : (cutData) =>{
            const cutKeyData : any = [];

            for(let i in cutData){
                cutKeyData.push(Number(cutData[i].rowKey));
            }

            if(gridRef.current){
                gridRef.current.getInstance().removeRows(cutKeyData);
            } 
        },

        //시트 초기화
        clear : () =>{
            if(gridRef.current){
                gridRef.current.getInstance().clear();
            }    
        },

        rightClick : () => {
            return rowAllValue
        }


    }));

    // 주어진 키들이 모두 빈 값인지 확인하는 함수
    function isRowEmpty(row : any, keys : any) {
        for (const key of keys) {
            const value = row[key];
            if (value !== null && value !== undefined && value.toString().trim() !== '') {
                return false;
            }
        }
        return true;
    }

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

    // 우클릭 조회
    gridRef.current?.getInstance().on('mousedown', (ev :any) => {
        rightClickValue = []     
        rowAllValue = []; 
        window.oncontextmenu = function(){
            rightClickValue = gridRef.current?.getInstance().getFocusedCell();
            // 우클릭 조회한 데이터 가져오기
            rowAllValue = gridRef.current?.getInstance().getRow(rightClickValue.rowKey)
            return false; // 우클릭 시 윈도우 기본 속성 못나오게 막기 
        }
        keyDownCellValue = gridRef.current?.getInstance().getFocusedCell(); //엔터키 방지에 사용할 것
    })

    // 엔터 키 방지
    gridRef.current?.getInstance().on('keydown', (ev: any) => {
        try {
            if (ev.keyboardEvent.key === "Enter") {
                if(keyDownCellValue.rowKey === null){
                    ev.stop();
                }
            }
        } catch (error) {
            console.error("Error handling keydown event:", error);
        }
    });
    
   
    

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
                {!isInitialized&&<div></div>}
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
                        contextMenu={null as any} // 우클릭 조회 없애기     
                />
                }
            </div>
        </div>
    )   
    
}
)

export default ToastGrid;