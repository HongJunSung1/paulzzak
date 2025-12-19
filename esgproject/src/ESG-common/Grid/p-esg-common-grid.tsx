import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import '../../global.d.ts';

import 'tui-grid/dist/tui-grid.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import Grid from '@toast-ui/react-grid';
import SearchBox from '../SearchBox/p-esg-common-SearchBox.tsx';
import DatePick from '../DatePicker/p-esg-common-datePicker.tsx';
import { createRoot } from 'react-dom/client';
// import 'tui-pagination/dist/tui-pagination.css';
import styles from './p-esg-common-grid.module.css';

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
  onClick: (gridRef: any) => void;
};

type ModifiedRows = {
  createdRows: any[];
  updatedRows: any[];
  deletedRows: any[];
};

type gridAr = {
  DataSet: string;
  grid: any[];
};




// ====== 전역(모듈 스코프) : 스타일 중복 삽입 방지 ======
let gridInputStyleInjected = false;

const ToastGrid = forwardRef<any, CustomGridProps>(
  (
    { title, source, columns, headerOptions, onChange, gridId, addRowBtn, onClick },
    ref,
  ) => {
    const gridRef = useRef<Grid | null>(null);
    const gridWrapperRef = useRef<HTMLDivElement>(null);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isClickRowAppend, setCollapsed] = useState(false);
    const [appendRowText, setAppendRowText] = useState(false);

    const isNormalizingRef = useRef(false);

    // 우클릭/엔터 방지용 값들은 렌더링과 무관하게 유지되어야 하므로 ref로
    const rightClickValueRef = useRef<any>(null);
    const rowAllValueRef = useRef<any>(null); // ✅ Row | null 문제 방지: 배열 타입 금지
    const keyDownCellValueRef = useRef<any>(null);

    const rafIdRef = useRef<number | null>(null);

    // 그리드 랜더링하기
    const safeRefreshLayout = () => {
      if (!gridRef.current) return;
      const inst = gridRef.current.getInstance?.();
      if (!inst) return;
    
      // 연속 호출 방지 (layout thrash 방지)
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        inst.refreshLayout();
      });
    };

    useEffect(() => {
      // mount 직후 1회
      safeRefreshLayout();
    
      const el = gridWrapperRef.current;
      if (!el) return;
    
      // wrapper 크기 변할 때마다 refresh
      const ro = new ResizeObserver(() => {
        safeRefreshLayout();
      });
      ro.observe(el);
    
      return () => {
        ro.disconnect();
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      };
    }, []);


    // ==========================
    // 1) 초기화/레이아웃 갱신
    // ==========================
    useEffect(() => {
      const timer = window.setTimeout(() => {
        const inst = gridRef.current?.getInstance();
        if (inst) {
          setIsInitialized(true);
          inst.refreshLayout();
        }
      }, 100);

      return () => window.clearTimeout(timer);
    }, []);

    // 데이터가 바뀌는 경우 레이아웃만 가볍게 갱신(기존처럼 100ms 딜레이 유지)
    useEffect(() => {
      if (!isInitialized) return;
      const timer = window.setTimeout(() => {
        const inst = gridRef.current?.getInstance();
        if (inst) inst.refreshLayout();
      }, 100);

      return () => window.clearTimeout(timer);
    }, [isInitialized, source]);

    // ==========================
    // 2) Grid input 테두리 제거 CSS (중복 삽입 방지)
    // ==========================
    useEffect(() => {
      if (gridInputStyleInjected) return;

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

      gridInputStyleInjected = true;
    }, []);

    // ==========================
    // 3) 스크롤 저장/복원 (기존 동작 유지)
    // ==========================
    function saveScrollPosition(grid: any) {
      const container = grid?.el?.querySelector(
        '.tui-grid-rside-area .tui-grid-body-area',
      ) as HTMLElement | null;

      if (!container) return { scrollLeft: 0, scrollTop: 0 };
      return { scrollLeft: container.scrollLeft, scrollTop: container.scrollTop };
    }

    function restoreScrollPosition(
      grid: any,
      pos: { scrollLeft: number; scrollTop: number },
    ) {
      const container = grid?.el?.querySelector(
        '.tui-grid-rside-area .tui-grid-body-area',
      ) as HTMLElement | null;

      if (!container) return;
      container.scrollLeft = pos.scrollLeft;
      container.scrollTop = pos.scrollTop;
    }

    // ==========================
    // 4) Tab 키 처리 (현재 넣어둔 방식 유지)
    // ==========================
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const inst = gridRef.current?.getInstance();
        if (!inst) return;

        const focusedCell = inst.getFocusedCell?.();
        if (!focusedCell || focusedCell.rowKey == null || focusedCell.columnName == null) return;

        const rowCnt = inst.getRowCount?.() ?? 0;
        const colName = focusedCell.columnName;

        if (event.key === 'Tab') {
          event.preventDefault();
          event.stopPropagation();

          const showCol = (columns || []).filter((item: any) => !item.hidden);
          if (!showCol.length) return;

          let rowKey: any = focusedCell.rowKey;
          let currentColumnIndex = showCol.findIndex((c: any) => c.name === colName);
          if (currentColumnIndex < 0) return;

          let nextColumnIndex = (currentColumnIndex + 1) % showCol.length;
          let nextColumnName = showCol[nextColumnIndex]?.name;

          if (rowKey !== null && rowKey !== undefined) {
            rowKey = Number(rowKey);

            if (nextColumnIndex === 0) {
              rowKey += 1;
              if (rowKey >= rowCnt) rowKey = 0;
            }

            inst.finishEditing();

            window.setTimeout(() => {
              inst.focusAt(rowKey, nextColumnIndex);
            }, 50);

            window.setTimeout(() => {
              if (nextColumnName) inst.startEditing(rowKey, nextColumnName);
            }, 100);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [columns]);

    // ==========================
    // 5) 행 추가 UI (기존 기능 유지)
    // ==========================
    function clickRowAppend() {
      setCollapsed((prev) => !prev);
      if (isClickRowAppend === false) setAppendRowText(false);
    }

    const clickRowOneAppend = () => {
      const inst = gridRef.current?.getInstance();
      if (!inst) return;

      inst.appendRow();
      inst.refreshLayout();
    };

    const [setNumber, setText] = useState<string>('');

    const changeNumber = (e: any) => {
      setText(e.target.value);
    };

    const handleAppendRows = () => {
      const count = parseInt(setNumber, 10);
      if (isNaN(count)) return;

      if (count > 100) {
        setAppendRowText(true);
        return;
      }

      setAppendRowText(false);
      const inst = gridRef.current?.getInstance();
      if (inst) {
        for (let i = 0; i < count; i++) inst.appendRow();
      }

      clickRowAppend();
      setText('0');
    };

    const activeEnter = (e: any) => {
      if (e.key === 'Enter') handleAppendRows();
    };

    // ==========================
    // 6) 커스텀 렌더러들 (기능 유지 + TS any 명시)
    // ==========================
    class CheckBox {
      el: HTMLInputElement;
      grid: any;
      rowKey: any;
      columnName: any;

      constructor(props: any) {
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
        this.el.addEventListener('change', this.onChange.bind(this));
      }

      getElement() {
        return this.el;
      }

      render(props: any) {
        
        const value = String(props.value);
        this.el.checked = value === '1';
        this.el.disabled = props.columnInfo.renderer.options?.disabled || false;
      }

      onChange(event: any) {
        const newValue = event.target.checked ? '1' : '0';
        this.grid.dispatch('setValue', this.rowKey, this.columnName, newValue);
      }
    }

    class SearchBoxRenderer {
      el: HTMLDivElement;
      grid: any;
      rowKey: any;
      columnInfo: any;
      root: any;

      constructor(props: any) {
        const el = document.createElement('div');
        this.el = el;

        this.grid = props.grid;
        this.rowKey = props.rowKey;
        this.columnInfo = props.columnInfo;
        this.root = createRoot(this.el);
        this.render(props);
      }

      getElement() {
        return this.el;
      }

      render(props: any) {
        if (!this.root) return;
        const value = props.value;
        this.root.render(
          <SearchBox
            value={value}
            onChange={(value: any) => this.onChange(value)}
            searchCode={this.columnInfo.renderer.options?.searchCode || 0}
            onGridChange={(value: any) => {
              this.gridChange(value);
              // this.onChange(value); // 여기서 this.onChange(value)까지 호출하면 중복 setValue 폭탄나옴
            }}
            isGrid={true}
          />,
        );
      }

      onChange(newValue: any) {
        if (newValue !== 0 && typeof newValue === 'object') {
          const options = this.columnInfo.renderer.options || {};

          const focusRowKey = this.rowKey;
          const focusColName = this.columnInfo.name;

          const codeCol = options.CodeColName;
          if (codeCol && newValue.code !== undefined) {
            this.grid.dispatch('setValue', this.rowKey, codeCol, newValue.code);
          }

          ['InfoCol1', 'InfoCol2', 'InfoCol3'].forEach((key: any) => {
            const colName = options[key];
            const colValue = newValue.extra?.[key];
            if (colName && colValue !== undefined) {
              this.grid.dispatch('setValue', this.rowKey, colName, colValue);
            }
          });

          this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, newValue.display);

          // ✅ 포커스 복원 (재렌더 끝난 뒤)
          requestAnimationFrame(() => {
            try {
              (this.grid as any).focus?.(focusRowKey, focusColName, false);
            } catch {}
          });
        }
      }

      gridChange(newValue: any) {
        this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, newValue.display);
      }
      destroy() {
        try { this.root?.unmount?.(); } catch {}
        try { this.el.innerHTML = ''; } catch {}
      }
    }

    class Button {
      el: HTMLInputElement;
      grid: any;
      rowKey: any;
      columnName: any;
      clickFunc: Function;

      constructor(props: any) {
        const el = document.createElement('input');
        el.type = 'button';

        el.style.display = 'block';
        el.style.margin = 'auto';
        el.style.position = 'relative';
        el.style.top = '50%';
        el.style.height = '80%';
        el.style.width = '85%';
        el.style.padding = '3px 5px';
        el.style.fontSize = '14px';
        el.style.fontWeight = 'bold';
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
        this.clickFunc = props.columnInfo.renderer.options?.clickFunc || function () {};

        this.render(props);
        this.el.addEventListener('click', this.onClick.bind(this));
      }

      getElement() {
        return this.el;
      }

      render(props: any) {
        const btnName = props.columnInfo.renderer.options?.btnName || '+';
        this.el.value = btnName;
        this.el.disabled = props.columnInfo.renderer.options?.disabled || false;
      }

      onClick(_event: any) {
        this.clickFunc(this.rowKey, this.columnName);
      }
    }

    class NumberCheck {
      el: HTMLElement;
      grid: any;
      rowKey: any;
      columnInfo: any;

      constructor(props: any) {
        const el = document.createElement('span');
        el.style.float = 'right';
        el.style.paddingRight = '5px';

        this.grid = props.grid;
        this.rowKey = props.rowKey;
        this.columnInfo = props.columnInfo;

        const formattedValue = this.formatValue(props.value?.replace(',', ''));
        el.innerText = formattedValue;
        this.el = el;
      }

      getElement() {
        return this.el;
      }

      formatValue(value: any) {
        let commaValue = '0';

        if (value) commaValue = String(value).replace(/,/gi, '');

        if (commaValue === null || commaValue === undefined || isNaN(Number(commaValue))) {
          this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, commaValue);
          return String(commaValue ?? '');
        }

        const option = { maximumFractionDigits: 5 };
        this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, Number(commaValue).toFixed(5));
        return Number(value).toLocaleString('ko-KR', option);
      }
    }

    class DateBox {
      el: HTMLDivElement;
      grid: any;
      rowKey: any;
      columnInfo: any;
      root: any;
      columnName: any;

      constructor(props: any) {
        const el = document.createElement('div');
        this.el = el;
        el.style.width = '100%';
        el.style.height = '100%';

        this.grid = props.grid;
        this.rowKey = props.rowKey;
        this.columnInfo = props.columnInfo;
        this.columnName = props.columnInfo.name;
        this.root = createRoot(this.el);

        this.render(props);
      }

      getElement() {
        return this.el;
      }

      render(props: any) {
        if (!this.root) return;
        this.root.render(
          <DatePick
            value={props.value}
            onChange={(value: any) => this.onChange(value)}
            type={this.columnInfo.renderer.options?.dateType || 'date'}
            isGrid={true}
          />,
        );
      }

      onChange(newValue: any) {
        this.grid.dispatch('setValue', this.rowKey, this.columnName, newValue);
        const focusRowKey = this.rowKey;
        const focusColName = this.columnInfo.name;
        // ✅ 포커스 복원 (재렌더 끝난 뒤)
        requestAnimationFrame(() => {
          try {
            (this.grid as any).focus?.(focusRowKey, focusColName, false);
          } catch {}
        });
      }
      destroy() {
        try { this.root?.unmount?.(); } catch {}
        try { this.el.innerHTML = ''; } catch {}
      }
    }

    class SumData {
      el: HTMLElement;
      grid: any;
      rowKey: any;
      columnInfo: any;

      constructor(props: any) {
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
        if (columnsToSum?.length > 0) {
          columnsToSum.forEach((column: any) => {
            const value = rowData?.[column];
            if (!isNaN(Number(value))) total += Number(value);
          });
        }

        const option = { maximumFractionDigits: 5 };
        this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, total.toLocaleString('ko-KR', option));
        return total.toLocaleString('ko-KR', option);
      }
    }

    class PercentData {
      el: HTMLElement;
      grid: any;
      rowKey: any;
      columnInfo: any;

      constructor(props: any) {
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

        let sumTotal = 0;
        let divideTotal = 0;

        if (columnsToSum?.length > 0) {
          columnsToSum.forEach((column: any) => {
            const value = rowData?.[column];
            if (!isNaN(Number(value))) sumTotal += Number(value);
          });
        }

        if (columnsToDivide?.length > 0) {
          columnsToDivide.forEach((column: any) => {
            const value = rowData?.[column];
            if (!isNaN(Number(value))) divideTotal += Number(value);
          });
        }

        const option = { maximumFractionDigits: 2 };
        const result = Number(sumTotal / divideTotal) * 100;

        if (isNaN(result)) {
          this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, '0');
          return '0';
        }

        this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, result.toLocaleString('ko-KR', option) + '%');
        return result.toLocaleString('ko-KR', option) + '%';
      }
    }

    class DivideData {
      el: HTMLElement;
      grid: any;
      rowKey: any;
      columnInfo: any;

      constructor(props: any) {
        const el = document.createElement('span');
        el.style.float = 'right';
        el.style.paddingRight = '5px';

        this.grid = props.grid;
        this.rowKey = props.rowKey;
        this.columnInfo = props.columnInfo;

        const formattedValue = this.divideValue();
        el.innerText = formattedValue;
        this.el = el;
      }

      getElement() {
        return this.el;
      }

      divideValue() {
        const rowData = this.grid.getRow(this.rowKey);
        const columnsToSum = this.columnInfo.renderer.options.sumAr;
        const columnsToDivide = this.columnInfo.renderer.options.divideAr;

        let sumTotal = 0;
        let divideTotal = 0;

        if (columnsToSum?.length > 0) {
          columnsToSum.forEach((column: any) => {
            const value = rowData?.[column];
            if (!isNaN(Number(value))) sumTotal += Number(value);
          });
        }

        if (columnsToDivide?.length > 0) {
          columnsToDivide.forEach((column: any) => {
            const value = rowData?.[column];
            if (!isNaN(Number(value))) divideTotal += Number(value);
          });
        }

        const option = { maximumFractionDigits: 2 };
        const result = Number(sumTotal / divideTotal);

        if (isNaN(result)) {
          this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, '0');
          return '0';
        }

        this.grid.dispatch('setValue', this.rowKey, this.columnInfo.name, result.toLocaleString('ko-KR', option));
        return result.toLocaleString('ko-KR', option);
      }
    }

    // ==========================
    // 7) columns 변이 방지(효율 + 안전)
    //    - 기능은 동일하게 "렌더러 적용된 columns"을 Grid에 전달
    // ==========================
    const processedColumns = useMemo(() => {
      return (columns ?? []).map((col: any) => {
        const next = { ...col };
      
        // renderer가 없으면 그대로
        if (!next.renderer) return next;
      
        // 이미 커스텀 렌더러(함수/클래스)로 변환된 경우 그대로
        // (즉, type이 string이 아니면 건드리지 않음)
        const r = next.renderer;
        const rType = r?.type;

        if (!rType) return next; // type이 없으면 건드리지 않고 통과
        if (typeof rType !== "string") return next;
      
        // 여기부터는 문자열 타입을 -> 클래스 타입으로 변환
        if (rType === "checkbox") {
          next.renderer = {
            type: CheckBox,
            options: { disabled: next.disabled || false },
          };
          return next;
        }
      
        if (rType === "searchbox") {
          next.renderer = {
            type: SearchBoxRenderer,
            options: {
              searchCode: r.options?.searchCode || 0,
              CodeColName: r.options?.CodeColName || "",
              InfoCol1: r.options?.InfoCol1 || "",
              InfoCol2: r.options?.InfoCol2 || "",
              InfoCol3: r.options?.InfoCol3 || "",
            },
          };
          return next;
        }
      
        if (rType === "button") {
          next.renderer = {
            type: Button,
            options: {
              btnName: r.options?.btnName || "",
              clickFunc: r.options?.clickFunc || function () {},
            },
          };
          return next;
        }
      
        if (rType === "number") {
          // ✅ 표시만 숫자 포맷 (데이터는 그대로)
          next.formatter = ({ value }: any) => {
            if (value === null || value === undefined) return '';
            const s = String(value).replace(/,/g, '').trim();
            if (s === '') return '';
            const n = Number(s);
            if (Number.isNaN(n)) return '';
            return n.toLocaleString('ko-KR');
          };
        
          // ✅ renderer 제거 (formatter로 표시)
          delete (next as any).renderer;
        
          // ✅ 오른쪽 정렬
          next.align = next.align ?? 'right';
        
          // ✅ 화면에서 편집 금지로 준 경우: editor만 제거 (색 안 바뀜)
          if (next.editable === false || next.readOnly === true) {
            delete (next as any).editor;
          }
        
          // ✅ 가장 중요: 공통에서 editor를 "강제로 추가하지 않는다"
          // if (!next.editor) next.editor = 'text';  // ❌ 삭제
        
          return next;
        }
      
        if (rType === "datebox") {
          next.renderer = {
            type: DateBox,
            options: { dateType: r.options?.dateType || "date" },
          };
          return next;
        }
      
        if (rType === "sum") {
          next.renderer = {
            type: SumData,
            options: { sumAr: r.options?.sumAr || [] },
          };
          return next;
        }
      
        if (rType === "percent") {
          next.renderer = {
            type: PercentData,
            options: {
              sumAr: r.options?.sumAr || [],
              divideAr: r.options?.divideAr || [],
            },
          };
          return next;
        }
      
        if (rType === "divide") {
          next.renderer = {
            type: DivideData,
            options: {
              sumAr: r.options?.sumAr || [],
              divideAr: r.options?.divideAr || [],
            },
          };
          return next;
        }
      
        // 알 수 없는 renderer.type 문자열이면 그대로 둠(터지면 원인 추적 가능)
        return next;
      });
    }, [columns]);

    // ✅ number 컬럼 name 목록 (원본 columns 기준: renderer.type === 'number')
    const numberColSet = useMemo(() => {
      return new Set(
        (columns ?? [])
          .filter((c: any) => c?.renderer?.type === 'number')
          .map((c: any) => c.name),
      );
    }, [columns]);

    // checkbox 컬럼 
    const checkboxColSet = useMemo(() => {
      return new Set(
        (columns ?? [])
          .filter((c: any) => c?.renderer?.type === 'checkbox')
          .map((c: any) => c.name),
      );
    }, [columns]);

    // 체크박스 정규화함수
    const normalizeCheckbox = (v: any): '0' | '1' => {
      if (v === true || v === '1' || v === 1 || v === 'Y') return '1';
      return '0'; // false, undefined, null 전부 0
    };
    
    // ✅ row 단위로 “빈 값 기본 채우기”
    const fillEmptyDefaults = (row: any) => {
      (columns ?? []).forEach((col: any) => {
        const key = col.name;
        const v = row[key];
      
        // 비어있음 판단(빈문자열/undefined/null)
        const isEmpty = v === null || v === undefined || String(v).trim() === '';
      
        if (!isEmpty) return;
      
        if (numberColSet.has(key)) {
          row[key] = '0';          // 숫자는 0
        } else if (checkboxColSet.has(key)) {
          row[key] = '0';     // ✅ 미체크도 0
        } else {
          row[key] = '';
        }
        });
          return row;
        };

    // ==========================
    // 8) Grid 이벤트들: "렌더마다 등록" 금지 → useEffect로 1회 등록/해제
    // ==========================
     useEffect(() => {
      const inst = gridRef.current?.getInstance();
      if (!inst) return;
    
      // ✅ 숫자 정규화 함수 (쉼표 제거 + NaN/빈값 방어)
      const normalizeNumber = (v: any) => {
        const s = String(v ?? '').replace(/,/g, '').trim();
        if (s === '' || s.toLowerCase() === 'nan') return '0';
        if (!/^-?\d+(\.\d+)?$/.test(s)) return '0';
        return s;
      };
    
      // afterChange
      const handleAfterChange = (ev: any) => {
        if (isNormalizingRef.current) return;
      
        // ✅ 숫자 컬럼만 먼저 정규화
        if (ev?.changes?.length) {
          isNormalizingRef.current = true;
          try {
            ev.changes.forEach((c: any) => {
            
              // 숫자 컬럼
              if (numberColSet.has(c.columnName)) {
                const cleaned = normalizeNumber(c.value);
                if (cleaned !== String(c.value ?? '')) {
                  inst.setValue(c.rowKey, c.columnName, cleaned);
                }
                return;
              }
            
              // ✅ checkbox 컬럼
              if (checkboxColSet.has(c.columnName)) {
                const cleaned = normalizeCheckbox(c.value);
                if (cleaned !== String(c.value ?? '')) {
                  inst.setValue(c.rowKey, c.columnName, cleaned);
                }
              }
            });
          } finally {
            isNormalizingRef.current = false;
          }
        }

        // ✅ 변경내역 수집 (기존 로직 유지)
        const modifiedRows = inst.getModifiedRows?.();
        const changes: ModifiedRows = {
          createdRows: modifiedRows?.createdRows ?? [],
          updatedRows: modifiedRows?.updatedRows ?? [],
          deletedRows: modifiedRows?.deletedRows ?? [],
        };
      
        const gridArData: any[] = [];
        gridArData.push(...changes.createdRows);
        gridArData.push(...changes.updatedRows);

        // ✅ 여기서 기본값 채우기
        for (let i = 0; i < gridArData.length; i++) {
          fillEmptyDefaults(gridArData[i]);
          delete gridArData[i]._attributes;
        }
      
        const gridArChange: gridAr = { DataSet: gridId, grid: gridArData };
      
        // ✅ 기존 기능 유지: 변경 후 스크롤 복원
        const savedPosition = saveScrollPosition(inst);
        onChange(gridId, gridArChange);
        window.setTimeout(() => restoreScrollPosition(inst, savedPosition), 0);
      };
    
      // mousedown (우클릭 조회 + 엔터 방지용 포커스 저장)
      const handleMouseDown = (_ev: any) => {
        rightClickValueRef.current = null;
        rowAllValueRef.current = null;
      
        // 엔터 방지용
        keyDownCellValueRef.current = inst.getFocusedCell?.();
      
        // 우클릭 메뉴 막기 + 해당 셀 데이터 저장
        const prev = window.oncontextmenu;
        window.oncontextmenu = function () {
          rightClickValueRef.current = inst.getFocusedCell?.();
          if (rightClickValueRef.current?.rowKey != null) {
            rowAllValueRef.current = inst.getRow?.(rightClickValueRef.current.rowKey) ?? null;
          }
          return false;
        };
      
        (handleMouseDown as any).__prevContext = prev;
      };
    
      // 엔터 키 방지
      const handleGridKeyDown = (ev: any) => {
        try {
          if (ev?.keyboardEvent?.key === 'Enter') {
            const saved = keyDownCellValueRef.current;
            if (saved?.rowKey === null) ev.stop();
          }
        } catch (error) {
          console.error('Error handling keydown event:', error);
        }
      };
    
      // click → onClick 호출
      const handleGridClick = (_e: any) => {
        onClick(inst);
      };
    
      inst.on('afterChange', handleAfterChange);
      inst.on('mousedown', handleMouseDown);
      inst.on('keydown', handleGridKeyDown);
      inst.on('click', handleGridClick);
    
      return () => {
        try {
          inst.off('afterChange', handleAfterChange);
          inst.off('mousedown', handleMouseDown);
          inst.off('keydown', handleGridKeyDown);
          inst.off('click', handleGridClick);
        } catch {}
      
        const prev = (handleMouseDown as any).__prevContext;
        if (typeof prev === 'function') window.oncontextmenu = prev;
      };
    }, [gridId, onChange, onClick, columns]);


    // 바깥 클릭 시 finishEditing (기존 기능 유지)
    useEffect(() => {
      const handleClickOutside = (_event: MouseEvent) => {
        const inst = gridRef.current?.getInstance();
        if (inst) inst.finishEditing();
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ==========================
    // 9) 공통 함수 노출(기존 기능 유지)
    // ==========================
    useImperativeHandle(ref, () => ({
      getCheckedRows: () => {
        const inst = gridRef.current?.getInstance();
        if (!inst) return [];

        const gridcheck: any[] = [];
        gridcheck.push(...inst.getCheckedRows());

        for (let i in gridcheck) {
          delete gridcheck[i].rowSpanMap;
          delete gridcheck[i].uniqueKey;
          delete gridcheck[i].sortKey;
          delete gridcheck[i]._attributes;
          delete gridcheck[i]._disabledPriority;
          delete gridcheck[i]._relationListItemMap;
        }

        const gridArCheck: gridAr = { DataSet: gridId, grid: gridcheck };
        return gridArCheck;
      },

      setRowData: (rowData: any) => {
        const inst = gridRef.current?.getInstance();
        if (!inst) return;

        for (let i in rowData) {
          inst.setRow(Number(rowData[i].rowKey), rowData[i]);
        }
      },

      setColumCheck: (gridData: any) => {
        const inst = gridRef.current?.getInstance();
        if (!inst) return [];

        const columnNames = (columns || []).map((c: any) => c.name);

        const isRowEmpty = (row: any, keys: any[]) => {
          for (const key of keys) {
            const value = row[key];
            if (
              value !== null &&
              value !== undefined &&
              String(value).trim() !== '' &&
              value !== 0 &&
              value !== '0' &&
              value !== 0.00000 &&
              value !== '0.00000'
            ) {
              return false;
            }
          }
          return true;
        };

        const NoDataList = gridData.filter((row: any) => isRowEmpty(row, columnNames));
        const cutData = NoDataList.map((k: any) => k.rowKey);
        inst.removeRows(cutData);

        const returnData = gridData.filter(
          (aItem: any) => !NoDataList.some((bItem: any) => bItem.rowKey === aItem.rowKey),
        );
        return returnData;
      },

      setEditFinish: () => {
        const inst = gridRef.current?.getInstance();
        if (inst) inst.finishEditing();
      },

      removeRows: (cutData: any) => {
        const inst = gridRef.current?.getInstance();
        if (!inst) return;

        const cutKeyData: any[] = [];
        for (let i in cutData) cutKeyData.push(Number(cutData[i].rowKey));
        inst.removeRows(cutKeyData);
      },

      clear: () => {
        const inst = gridRef.current?.getInstance();
        if (inst) inst.clear();
      },

      rightClick: () => {
        return rowAllValueRef.current;
      },

      getAllData: () => {
        return gridRef.current?.getInstance().getData();
      },

      refreshLayout: () => {
        gridRef.current?.getInstance().refreshLayout();
      },

      blur: () => {
        gridRef.current?.getInstance().blur();
      },

      getInstance: () => {
        return gridRef.current?.getInstance();
      },

      getRowData: (rowKey: any) => {
        return gridRef.current?.getInstance().getRow(rowKey);
      },
    }));

    // ==========================
    // 10) 엑셀 내보내기 (기존 기능 유지)
    // ==========================
    const ExportExcel = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const date = today.getDate();

      const fileName = `${title} ${year}-${month}-${date}`;

      const inst = gridRef.current?.getInstance();
      inst?.finishEditing();
      inst?.export('xlsx', { fileName });
    };

    return (
      <div className={styles.GridWrap}>
        <div className={styles.GridStatus}>
          <div className={styles.AppendRowContainer}>
            {addRowBtn && (
              <div className={styles.GridBtnWrap}>
                <div>
                  <button onClick={clickRowOneAppend} className={styles.GridBtn}>
                    행 추가
                  </button>
                </div>
                <div>
                  <button onClick={clickRowAppend} className={styles.GridManyBtn}>
                    다중 행 추가
                  </button>
                </div>
              </div>
            )}

            {isClickRowAppend && (
              <div className={styles.AppendRowWrap}>
                <span className={styles.AppendUnit}>
                  <input
                    type="number"
                    className={styles.AppendRowInput}
                    onChange={changeNumber}
                    value={setNumber}
                    onKeyDown={(e: any) => activeEnter(e)}
                  />
                  <button onClick={handleAppendRows} className={styles.GridBtn}>
                    행 추가
                  </button>
                  {appendRowText && (
                    <div className={styles.AppendRowText}>
                      행 추가는 최대 100개까지만 가능합니다.
                    </div>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className={styles.GridTitle}>{title}</div>
          <div className={styles.ExportBtn} onClick={ExportExcel} />
        </div>

        <div ref={gridWrapperRef} className={styles.GridWrap}>
          <Grid
            ref={gridRef}
            data={source}
            editingEvent={'click'}
            columns={processedColumns}
            bodyHeight={'fitToParent'}
            rowHeight={30}
            minRowHeight={30}
            heightResizable={false}
            rowHeaders={[{ type: 'rowNum', align: 'center' }, { type: 'checkbox' }]}
            contextMenu={null as any}
            header={headerOptions}
            columnOptions={{ resizable: true }}
          />
        </div>
      </div>
    );
  },
);

export default ToastGrid;
