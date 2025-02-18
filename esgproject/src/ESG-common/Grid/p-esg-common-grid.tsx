import React, {useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react'
import '../../global.d.ts';

import 'tui-grid/dist/tui-grid.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import Grid from '@toast-ui/react-grid';
import SearchBox from '../SearchBox/p-esg-common-SearchBox.tsx';
import DatePick from '../DatePicker/p-esg-common-datePicker.tsx';
import { createRoot } from 'react-dom/client';
// import 'tui-pagination/dist/tui-pagination.css'; //페이징처리 css
import styles from './p-esg-common-grid.module.css';   //그리드 수정 위해 css파일을 더 아래에 둠

type CustomGridProps = {
    title: string;
    source: any[];
    columns: any[];
    headerOptions: {
        height: number;
        complexColumns?: any[];
    };
    onChange: (gridId: string, changes: gridAr) => void;
    gridId: string;
    addRowBtn: boolean;
    onClick: (gridRef : any) => void;
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

const ToastGrid = forwardRef(({title, source, columns, headerOptions, onChange, gridId, addRowBtn, onClick}: CustomGridProps, ref) => {
    
    
    const gridRef = useRef<Grid | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isClickRowAppend, setCollapsed] = useState(false);
    const [appendRowText, setAppendRowText] = useState(false);
    const gridWrapperRef = useRef<HTMLDivElement>(null); // ✅ 최상위 DOM 요소를 위한 ref 추가

    // ✅ Grid가 렌더링될 때 refreshLayout() 실행 (에러 방지)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (gridRef.current && gridRef.current.getInstance()) {
                setIsInitialized(true);
                gridRef.current.getInstance().refreshLayout();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // 그리드 편집 시 테두리 제거
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .tui-grid-cell-content input[type='text'],
            .tui-grid-cell-content input[type='password'] {
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
            }
        `;

        
        document.head.appendChild(style);
    }, []);


    // 스크롤 위치 구하기
    const [scrollPosition, setScrollPosition] = useState({ scrollLeft: 0, scrollTop: 0 });

    // 스크롤 위치 저장 및 복원 함수 추가
    function saveScrollPosition(grid) {
        const container = grid?.el?.querySelector('.tui-grid-rside-area .tui-grid-body-area');
        if (!container) {
            return { scrollLeft: 0, scrollTop: 0 };
        }
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;
        return { scrollLeft, scrollTop };
    }
    
    function restoreScrollPosition(grid, { scrollLeft, scrollTop }) {
        const container = grid?.el?.querySelector('.tui-grid-rside-area .tui-grid-body-area');
        if (container) {
            container.scrollLeft = scrollLeft;
            container.scrollTop = scrollTop;
        }
    }


    // 우클릭 조회 담기 용
    let rightClickValue : any = []     
    let rowAllValue : any = []; 

    // 엔터키 방지용
    let keyDownCellValue : any = [];


    useEffect(() => {
        // setIsInitialized(false);
        const timer = setTimeout(()=> {
            setIsInitialized(true); // 시트값 변동 감지
            if(gridRef.current){
                gridRef.current.getInstance().refreshLayout();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // 탭 이동시 입력 시작 막기
    // useEffect(() => {
    //     const handleKeyDown = (event) => {
    //         if (event.key === 'Tab') {
    //             event.preventDefault();
    //             event.stopPropagation();
                
    //             let rowKey  : any = gridRef.current?.getInstance().getFocusedCell().rowKey;
    //             const colName : any = gridRef.current?.getInstance().getFocusedCell().columnName;
    //             const rowCnt  : any = gridRef.current?.getInstance().getRowCount();

    //             const showCol = columns.filter(item => item.hidden !== true)
    //             const currentColumnIndex : any = showCol.findIndex(column => column.name === colName);;
    //             const nextColumnIndex    : any = (currentColumnIndex + 1) % showCol.length;

    //             if(rowKey !== null){
    //                 if(nextColumnIndex === 0){
    //                     rowKey += 1
    //                     if(rowKey >= rowCnt){
    //                         rowKey = 0
    //                     }
    //                 }
    //                 gridRef.current?.getInstance().focusAt(rowKey, nextColumnIndex);
    //             }
    //         }
    //     };
    
    //     document.addEventListener('keydown', handleKeyDown, true);
    
    //     return () => {
    //       document.removeEventListener('keydown', handleKeyDown, true);
    //     };
    // }, [columns]);



    // ✅ Tab 키를 눌렀을 때 정상적으로 다음 셀로 이동하는 이벤트 핸들러
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!gridRef.current || !gridRef.current.getInstance()) return;

            const gridInstance = gridRef.current.getInstance();
            const focusedCell = gridInstance.getFocusedCell();

            if (!focusedCell || focusedCell.rowKey === null || focusedCell.columnName === null) return;

            let rowKey  : any = gridRef.current?.getInstance().getFocusedCell().rowKey;
            const colName = focusedCell.columnName;
            const rowCnt = gridInstance.getRowCount() ?? 0;

            if (event.key === 'Tab') {
                event.preventDefault();
                event.stopPropagation();

                const showCol = columns.filter(item => !item.hidden);
                let currentColumnIndex = showCol.findIndex(column => column.name === colName);
                let nextColumnIndex = (currentColumnIndex + 1) % showCol.length;
                let nextColumnName = showCol[nextColumnIndex]?.name;

                if (rowKey !== null) {
                    rowKey = Number(rowKey);

                    if (nextColumnIndex === 0) {
                        rowKey += 1;
                        if (rowKey >= rowCnt) {
                            rowKey = 0;
                        }
                    }

                    // ✅ 기존 편집 종료 후 focus 이동
                    gridInstance.finishEditing();

                    setTimeout(() => {
                        gridInstance.focusAt(rowKey, nextColumnIndex);
                    }, 50);
    
                    setTimeout(() => {
                        if (nextColumnName) {
                            gridInstance.startEditing(rowKey, nextColumnName);
                        }
                    }, 100); // ✅ focusAt() 후 안전하게 startEditing() 실행
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [columns]);



    // 행 추가 화면 나타내기
    function clickRowAppend(){
        setCollapsed(prevValue => !prevValue);
        if(isClickRowAppend === false){
            setAppendRowText(false);
        }
    }

    // 한 행만 추가하기
    const clickRowOneAppend = () => {
        if(gridRef.current){
            gridRef.current.getInstance().appendRow();
            gridRef.current.getInstance().refreshLayout();

            // gridRef.current.getInstance().prependRow({}); // 시트 맨 앞에 행 추가하기
        }
    }

    // 행 추가 개수 구하기
    const[setNumber, setText] = useState('');

    const changeNumber = (e) => {
        setText(e.target.value);        
    }

    const handleAppendRows = () => {

        if(parseInt(setNumber) > 100){
            setAppendRowText(true);
            return;
        } else{
            setAppendRowText(false);
            if(gridRef.current){
                for(let i = 0; i<parseInt(setNumber); i++){
                    gridRef.current.getInstance().appendRow();
                }
            }
            clickRowAppend();
            setText('0');
        }
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
          el.tabIndex = -1;
      
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

      // 2. 서치박스
      class SearchBoxRenderer {
        el: HTMLDivElement;
        grid: any;
        rowKey: any;
        columnInfo: any;
        root: any;
        codeColName : any;  
    
        constructor(props) {
            const el = document.createElement('div');
            this.el = el;
            this.grid = props.grid;
            this.rowKey = props.rowKey;
            this.columnInfo = props.columnInfo;
            this.root = createRoot(this.el); // createRoot 사용
            this.render(props);
        }
    
        getElement() {
            return this.el;
        }
    
        render(props) {
            const value = props.value;

            this.root.render(
                <SearchBox
                    value={value}
                    onChange={(value) => this.onChange(value)}
                    searchCode={this.columnInfo.renderer.options?.searchCode || 0}
                    onGridChange={(value) => this.gridChange(value)}
                    isGrid={true}
                />
            );
        }


        onChange(newValue) {
            if(newValue !== 0){
                this.grid.dispatch('setValue', this.rowKey, this.columnInfo.renderer.options?.CodeColName, newValue);
            }
        }

        gridChange(newValue){
            this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, newValue);
        }
    }

    // 3. 버튼
    class Button {
        el: HTMLInputElement;
        grid: any;
        rowKey: any;
        columnName: any;
        clickFunc: Function;
      
        constructor(props) {
            const el = document.createElement('input');
            el.type = 'button';
      
            // 스타일 추가
            el.style.display = 'block';
            el.style.margin = 'auto';
            el.style.position = 'relative';
            el.style.top = '50%';
            el.style.height = '80%';
            el.style.width = '85%';
            el.style.padding = '3px 5px';
            el.style.fontSize = '14px';
            el.style.fontWeight = "bold";
            el.style.backgroundColor = 'white';
            el.style.color = '#606060';
            el.style.border = '1px solid #606060';
            el.style.borderRadius = '4px';
            el.style.cursor = 'pointer';
            el.style.transition = 'background-color 0.3s ease';
            el.style.fontFamily = 'SpoqaHanSansNeo-Regular';
            el.tabIndex = -1;
      
            this.el = el;
            this.grid = props.grid;
            this.rowKey = props.rowKey;
            this.columnName = props.columnInfo.name;
            this.clickFunc = props.columnInfo.renderer.options?.clickFunc || function() {};
      
            this.render(props);
      
            // 이벤트 리스너 추가
            this.el.addEventListener('click', this.onClick.bind(this));
        }
      
        getElement() {
          return this.el;
        }
      
        render(props) {
          const btnName = props.columnInfo.renderer.options?.btnName || '+';
          this.el.value = btnName;
          this.el.disabled = props.columnInfo.renderer.options?.disabled || false;
        }
      
        onClick(event) {
          this.clickFunc(this.rowKey, this.columnName);
        }
      }

    // 4. 숫자 유효성 검사
    class NumberCheck {
        el: HTMLElement;
        grid: any;
        rowKey: any;
        columnName: any;
        columnInfo: any;

        constructor(props) {
          const el = document.createElement('span');
          el.style.float = 'right';
          el.style.paddingRight = '5px';

          this.grid = props.grid;
          this.rowKey = props.rowKey;
          this.columnInfo = props.columnInfo;
          let formattedValue = this.formatValue(props.value?.replace(',', ''));
          el.innerText = formattedValue;
          this.el = el;
        }
      
        getElement() {
          return this.el;
        }
      
        formatValue(value) {
          let commaValue = '0';

          if(value){
              commaValue = value.replace(/,/gi, '');
          }
          if (commaValue === null || commaValue === undefined || isNaN(Number(commaValue))) {
            return this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, commaValue);
          }
          const option = {
            maximumFractionDigits: 5 // 소수점 5자리까지 표시
          };

          this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, Number(commaValue).toFixed(5));
          return (Number(value).toLocaleString('ko-KR', option));
        }
    }

    // // 4. 숫자 유효성 검사
    // class NumberCheck {
    //     el: HTMLInputElement;
    //     grid: any;
    //     rowKey: any;
    //     columnName: any;
      
    //     constructor(props) {
    //       const el = document.createElement('input');
    //       el.type = 'text';
      
    //       el.style.width = '100%';
    //       el.style.textAlign = 'right';
    //       el.style.height = '28px';
    //       el.style.paddingRight = '5px';
    //       el.style.border = 'none'; 
    //       el.tabIndex = -1;
    //       el.style.fontFamily = 'SpoqaHanSansNeo-Regular';
    //       el.style.setProperty('fontFamily', 'SpoqaHanSansNeo-Regular', 'important');
      
    //       this.el = el;
    //       this.grid = props.grid;
    //       this.rowKey = props.rowKey;
    //       this.columnName = props.columnInfo.name;
      
    //       this.render(props);
      
    //       // 이벤트 리스너 추가
    //       this.el.addEventListener('blur', this.onBlur.bind(this));
    //       this.el.addEventListener('focus', this.onFocus.bind(this));
    //       this.el.addEventListener('click', this.onClick.bind(this));
    //       this.el.addEventListener('keydown', this.onKeydown.bind(this));
    //     }
      
    //     getElement() {
    //         return this.el;
    //     }
        
    //     render(props) {
    //         this.el.disabled = props.columnInfo.renderer.options?.disabled || false;
    //         this.el.style.color = props.columnInfo.renderer.options?.disabled == true ? "black" : "black";

    //         let value = '0';
        
    //         if (props.value !== null) {
    //           value = parseFloat(props.value).toFixed(5);
    //         }
        
    //         this.el.value = this.formatNumber(value);
    //     }
        
    //     formatNumber(value: string): string {
    //         const parts = value.split('.');
    //         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    //         // 소수점 이하가 모두 0이면 정수만 표시
    //         if (parts[1] && parseFloat(parts[1]) === 0) {
    //             return parts[0];
    //         }

    //         return parts.join('.');
    //     }

    //     onClick() {
    //         this.el.focus();
    //         this.el.setSelectionRange(0, this.el.value.length);
    //     }

    //     onKeydown(e) {
    //         if(e.key === "Enter"){
    //             this.el.blur();
    //         }
    //     }

    //     onFocus() {
    //         const value = parseFloat(this.el.value.replace(/,/g, ''));
    //         this.el.value = isNaN(value) ? '0' : value.toString();
    //     }
        
    //     onBlur() {
    //         let value = parseFloat(this.el.value);
    //         if (isNaN(value)) {
    //           value = 0;
    //         }
    //         this.el.value = this.formatNumber(value.toFixed(5));
    //         this.grid.dispatch('setValue', this.rowKey, this.columnName, value.toFixed(5));
    //     }

    // }


    // 5. 날짜박스
    class DateBox {
        el: HTMLDivElement;
        grid: any;
        rowKey: any;
        columnInfo: any;
        root: any;
        columnName: any;
    
        constructor(props) {
            const el = document.createElement('div');
            this.el = el;
            el.style.width = "100%";
            el.style.height = "100%";

            this.grid = props.grid;
            this.rowKey = props.rowKey;
            this.columnInfo = props.columnInfo;
            this.columnName = props.columnInfo.name;
            this.root = createRoot(this.el); // createRoot 사용
            this.render(props);
        }
    
        getElement() {
            return this.el;
        }
    
        render(props) {

            this.root.render(
                <DatePick
                    value={props.value}
                    onChange={(value) => this.onChange(value)}
                    type={this.columnInfo.renderer.options?.dateType || "date"}
                    isGrid={true}
                />
            );
        }

        onChange(newValue) {
            this.grid.dispatch('setValue', this.rowKey, this.columnName, newValue);
        }
    }
    
    // 6. 합계
    class SumData {
        el: HTMLElement;
        grid: any;
        rowKey: any;
        columnName: any;
        columnInfo: any;

        constructor(props) {    
            const el = document.createElement('span');
            el.style.float = 'right';
            el.style.paddingRight = '5px';

            this.grid = props.grid;
            this.rowKey = props.rowKey;
            this.columnInfo = props.columnInfo;
            const formattedValue = this.sumValue();
            el.innerText = formattedValue;
            this.el = el;
          }

        getElement() {
            return this.el;
        }

        sumValue() {
            const rowData = this.grid.getRow(this.rowKey);
            const columnsToSum = this.columnInfo.renderer.options.sumAr;

            let total = 0;
 
            if(columnsToSum.length > 0){
                columnsToSum.forEach((column) => {
                  const value = rowData[column];
                  if (!isNaN(Number(value))) {
                    total += Number(value);
                  }
                });
            }
            const option = {
                maximumFractionDigits: 5 // 소수점 5자리까지 표시
            };

            this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, total.toLocaleString('ko-KR', option));
            
            return total.toLocaleString('ko-KR', option); 
        }
    }

    // 7. 비율
    class PercentData {
        el: HTMLElement;
        grid: any;
        rowKey: any;
        columnName: any;
        columnInfo: any;

        constructor(props) {    
            const el = document.createElement('span');
            el.style.float = 'right';
            el.style.paddingRight = '5px';

            this.grid = props.grid;
            this.rowKey = props.rowKey;
            this.columnInfo = props.columnInfo;
            const formattedValue = this.percentValue();
            el.innerText = formattedValue;
            this.el = el;
        }

        getElement() {
            return this.el;
        }

        percentValue() {
            const rowData = this.grid.getRow(this.rowKey);
            const columnsToSum = this.columnInfo.renderer.options.sumAr;
            const columnsToDivide = this.columnInfo.renderer.options.divideAr;

            let sumTotal    = 0;
            let divideTotal = 0;
            let result      = 0;

            if(columnsToSum.length > 0){
                columnsToSum.forEach((column) => {
                  const value = rowData[column];
                  if (!isNaN(Number(value))) {
                    sumTotal += Number(value);
                  }
                });
            }

            if(columnsToDivide.length > 0){
                columnsToDivide.forEach((column) => {
                  const value = rowData[column];
                  if (!isNaN(Number(value))) {
                    divideTotal += Number(value);
                  }
                });
            }

            const option = {
                maximumFractionDigits: 2 // 소수점 2자리까지 표시
            };

            result = Number(sumTotal / divideTotal) * 100;

            if(isNaN(result)){
                this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, '0');
                return '0';
            } else{
                this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, result.toLocaleString('ko-KR', option) + '%');
                return result.toLocaleString('ko-KR', option) + '%';             
            }
        }

    }

    // 8. 나누기
    class DivideData {
        el: HTMLElement;
        grid: any;
        rowKey: any;
        columnName: any;
        columnInfo: any;

        constructor(props) {    
            const el = document.createElement('span');
            el.style.float = 'right';
            el.style.paddingRight = '5px';

            this.grid = props.grid;
            this.rowKey = props.rowKey;
            this.columnInfo = props.columnInfo;
            const formattedValue = this.percentValue();
            el.innerText = formattedValue;
            this.el = el;
        }

        getElement() {
            return this.el;
        }

        percentValue() {
            const rowData = this.grid.getRow(this.rowKey);
            const columnsToSum = this.columnInfo.renderer.options.sumAr;
            const columnsToDivide = this.columnInfo.renderer.options.divideAr;

            let sumTotal    = 0;
            let divideTotal = 0;
            let result      = 0;

            if(columnsToSum.length > 0){
                columnsToSum.forEach((column) => {
                  const value = rowData[column];
                  if (!isNaN(Number(value))) {
                    sumTotal += Number(value);
                  }
                });
            }

            if(columnsToDivide.length > 0){
                columnsToDivide.forEach((column) => {
                  const value = rowData[column];
                  if (!isNaN(Number(value))) {
                    divideTotal += Number(value);
                  }
                });
            }

            const option = {
                maximumFractionDigits: 2 // 소수점 2자리까지 표시
            };

            result = Number(sumTotal / divideTotal);

            if(isNaN(result)){
                this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, '0');
                return '0';
            } else{
                this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, result.toLocaleString('ko-KR', option));
                return result.toLocaleString('ko-KR', option);             
            }
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
        }else if(column.renderer && column.renderer.type === 'searchbox'){
            column.renderer = {
                type: SearchBoxRenderer,
                options: {
                  searchCode: column.renderer.options.searchCode || 0,
                  CodeColName : column.renderer.options.CodeColName || ""
                }
            };
        }else if(column.renderer && column.renderer.type === 'button'){
            column.renderer = {
                type: Button,
                options: {
                    btnName   : column.renderer.options.btnName   || "", 
                    clickFunc : column.renderer.options.clickFunc || function(){}
                }
            };
        }else if(column.renderer && column.renderer.type === 'number'){
            column.renderer = {
                type: NumberCheck,
                // options: {
                //     disabled: column.disabled || false
                // }
            }
        }else if(column.renderer && column.renderer.type === 'datebox'){
            column.renderer = {
                type: DateBox,
                options:{
                    dateType : column.renderer.options.dateType || "date"
                }
            }
        } else if(column.renderer && column.renderer.type === 'sum'){
            column.renderer = {
                type: SumData,
                options: {
                    sumAr : column.renderer.options.sumAr || []
                }
            }
        } else if(column.renderer && column.renderer.type === 'percent'){
            column.renderer = {
                type: PercentData,
                options: {
                    sumAr : column.renderer.options.sumAr || [],
                    divideAr : column.renderer.options.divideAr || []
                }
            }
        } else if(column.renderer && column.renderer.type === 'divide'){
            column.renderer = {
                type: DivideData,
                options: {
                    sumAr : column.renderer.options.sumAr || [],
                    divideAr : column.renderer.options.divideAr || []
                }
            }
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
        },

        //그리드 전체 데이터 가져오기
        getAllData : () => {
            return gridRef.current?.getInstance().getData();
        },

        // 그리드 사이즈 초기화
        refreshLayout : () => {
            gridRef.current?.getInstance().refreshLayout();
        },

        // 시트 포커스 초기화
        blur : () => {
            gridRef.current?.getInstance().blur();
        },

        // 그리드 인스턴스 가져오기
        getInstance : () => {
            return gridRef.current?.getInstance();
        },

        // 로우키 값으로 데이터 가져오기
        getRowData : (rowKey) => {
            return gridRef.current?.getInstance().getRow(rowKey);
        }


    }));

    // 주어진 키들이 모두 빈 값인지 확인하는 함수
    function isRowEmpty(row : any, keys : any) {
        for (const key of keys) {
            const value = row[key];
            if (value !== null && value !== undefined && value.toString().trim() !== '' && value !== 0 && value !== '0' && value !== 0.00000 && value !== '0.00000') {
                return false;
            }
        }
        return true;
    }

    // 엑셀 내보내기
    const ExportExcel = () => {
        let today = new Date();   

        let year = today.getFullYear(); // 년도
        let month = today.getMonth() + 1;  // 월
        let date = today.getDate();  // 날짜

        let fileName = title + " " + year + "-" + month + "-" + date

        gridRef.current?.getInstance().finishEditing();
        gridRef.current?.getInstance().export('xlsx',{fileName : fileName});
    }

    // 시트 수정 데이터 감지
    gridRef.current?.getInstance().on('afterChange', (ev) => {
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

        // 데이터 변경 후 스크롤 위치를 복원
        const savedPosition = saveScrollPosition(gridRef.current?.getInstance()); // 스크롤 위치 저장
        setScrollPosition(savedPosition);

        onChange(gridId, gridArChange);

        // 데이터를 갱신한 후 스크롤 위치를 복원
        setTimeout(() => {
            restoreScrollPosition(gridRef.current?.getInstance(), savedPosition);
        }, 0);
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
        
    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
          if (gridRef.current) {
            gridRef.current.getInstance().finishEditing();
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };  
    }, [gridRef]);


    gridRef.current?.getInstance().on(('click'), (e : any)=>{
        onClick(gridRef.current?.getInstance());
    });
    

    
    return (
        <div className={styles.GridWrap}>
            <div className = {styles.GridStatus}>
                <div className={styles.AppendRowContainer}>
                    {addRowBtn && 
                    <div className={styles.GridBtnWrap}>
                        <div>
                            {/* <button onClick={clickRowOneAppend} className={styles.GridSimpleBtn}>+</button> */}
                            <button onClick={clickRowOneAppend} className={styles.GridBtn}>행 추가</button>
                        </div>
                        <div>
                            <button onClick={clickRowAppend} className={styles.GridManyBtn}>다중 행 추가</button>
                        </div>
                    </div>}
                    {isClickRowAppend &&   
                        <div className={styles.AppendRowWrap}>
                            <span className={styles.AppendUnit}>
                                <input type= "number" className={styles.AppendRowInput} onChange={changeNumber} value={setNumber} onKeyDown={(e) => activeEnter(e)}></input>
                                <button onClick={handleAppendRows} className={styles.GridBtn}>행 추가</button>
                                {appendRowText && <div className={styles.AppendRowText}>행 추가는 최대 100개까지만 가능합니다.</div>}
                            </span>
                        </div>
                    }
                </div>
                <div className = {styles.GridTitle}>{title}</div>
                <div className = {styles.ExportBtn} onClick={ExportExcel}/>
            </div>
            <div  ref={gridWrapperRef} className={styles.GridWrap}>  
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
                        // header={{height: 40}}
                        header={headerOptions}
                        columnOptions={{resizable:true}}                        
                        // pageOptions={{useClient: true, perPage: 3}} // 페이징처리
                />
                }
            </div>
        </div>
    )   
    
}
)

export default ToastGrid;