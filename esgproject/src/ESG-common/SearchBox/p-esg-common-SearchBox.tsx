import React,{ useRef,useState, useEffect} from 'react'

import styles from './p-esg-common-SearchBox.module.css';
import { SP_Request } from '../../hooks/sp-request.tsx';


const SearchBox = (settings : any) => {

    const [text, setText] = useState(settings.value || '');
    const [result, setResult] = useState<any>();
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const InputRef = useRef<HTMLInputElement>(null);
    const ResultRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // useEffect(() => {
    //     setText(settings.value || '');
    // }, [settings.value]);
    
    // 텍스트 초기화
    useEffect(() => {
        if (settings.resetTrigger) {
          setText(''); // 텍스트 초기화
        }
      }, [settings.resetTrigger]);    

    const changeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (settings.onChange) {
            settings.onChange(0);
        }
        setText(e.target.value);
    };


    const onkeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) =>{
        setResult([]);
        if(e.key === 'Enter'){
            if(text !== "" && e.currentTarget.value.trim() !== ""){
                const resultData = await SP_Request("S_SearchBox_Input_Query",[{SearchCode : settings.searchCode, JoinCode : settings.joinCode, JoinColumn : settings.joinColumn, ColumnCode : settings.columnCode, Text : e.currentTarget.value, DataSet : "DataSet1"}]);
                if(resultData.length > 0){
                    setResult(resultData[0]);
                }else{
                    setText('');
                    if (settings.onChange) {
                        settings.onChange(0);
                    }
                }
                const Rect = InputRef.current?.getBoundingClientRect();
                if(Rect){
                    setPosition({top:Rect.top, left:Rect.left});
                }
                
                // 전체 사이즈
                const totHeight = window.innerHeight;
                
                setTimeout(()=>{
                    setIsOpen(true);
                    const Top = Rect?.top || 0;
                    const OffsetHeight = ResultRef.current?.offsetHeight || 0;
                    if(Top + OffsetHeight >= totHeight){
                        if(Rect){
                            setPosition({top:Rect.top - OffsetHeight - 35, left:Rect.left});
                        }
                    }
                },100)
            }
        }
    }

    // const searchClick = (value, valueCode) => {
    //     setText(value);

    //     if (settings.onChange) {
    //         settings.onChange(valueCode);
    //     }

    //     if(settings.onGridChange){
    //         settings.onGridChange(value);
    //     }
        
    //     setIsOpen(false);
    // }
    
    const searchClick = (value, valueCode, extraInfo = {}) => {

        const payload = {
            display: value,
            code: valueCode,
            extra: extraInfo  // ✅ InfoCol1, InfoCol2, InfoCol3 포함
        };

        setText(value);


        if (settings.onChange) {
            settings.onChange(payload);
        }
    
        if (settings.onGridChange) {
            settings.onGridChange(payload);
        }
    
        setIsOpen(false);
    };

    const ClickHandler = async () =>{
        const resultData = await SP_Request("S_SearchBox_All_Query",[{SearchCode : settings.searchCode, JoinCode : settings.joinCode, JoinColumn : settings.joinColumn, ColumnCode : settings.columnCode, DataSet : "DataSet1"}]);
        setResult(resultData[0]);
        const Rect = InputRef.current?.getBoundingClientRect();
        if(Rect){
            setPosition({top:Rect.top, left:Rect.left});
        }
            
        // 전체 사이즈
        const totHeight = window.innerHeight;

        
        if(isOpen){
            setIsOpen(false);
        }else{
            setIsOpen(true);

            setTimeout(()=>{
                const Top = Rect?.top || 0;
                const OffsetHeight = ResultRef.current?.offsetHeight || 0;
                if(Top + OffsetHeight >= totHeight){
                    if(Rect){
                        setPosition({top:Rect.top - OffsetHeight - 35, left:Rect.left});
                    }
                }    
            },0)
        }
    }

    const RemoveText = () => {
        setIsOpen(false);
        setText('');
        if (settings.onChange) {
            settings.onChange(0);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [searchRef]);

      const focusInput = () => {
        InputRef.current?.focus();
      }
     

      return (
        <>
            <div ref={searchRef} className={styles.SearchBoxWrap}>
                {settings.name && <div className={styles.SearchBoxBoxTitle}>{settings.name}</div>}
                <div className={styles.InputWrap}>
                    <input
                        ref = {InputRef}
                        className={settings.isGrid ? styles.InputGrid : styles.Input}
                        type="text"
                        value={text}
                        tabIndex={-1}
                        style={{ width: settings.width ? settings.width : '100%' }}
                        onChange={changeText}
                        onKeyUp={onkeyUp}
                        onClick={focusInput}
                        {...(settings.id ? { id: settings.id } : {})}
                    />
                    {settings.name && (
                        <button
                            className={styles.BtnClear}
                            onClick={RemoveText}
                            style={{ display: text.length > 0 ? "block" : "none" }}
                        ></button>
                    )}
                    <div className={settings.isGrid ? styles.SearchGridImg : styles.SearchImg} onClick={ClickHandler} />
                </div>
                {isOpen && result.length > 0 && (
                    <div className={styles.tableWrap} style={{top : position.top + 32, left : position.left - 5, position: 'fixed'}} ref={ResultRef}>
                        <table style={{width: result[0].TotSize+'px'}}>
                            <tbody>
                                    <tr>
                                        <th className={styles.SearchItemNum} style={{width:"25px"}}>No</th>
                                        <th className={styles.SearchItemNum}>{result[0]?.ColNameKr ? result[0].ColNameKr : ""}</th>
                                        {result[0].InfoCol1 !== undefined && <th className={styles.SearchItemNum}>{result[0].InfoCol1NameKr}</th>}
                                        {result[0].InfoCol2 !== undefined && <th className={styles.SearchItemNum}>{result[0].InfoCol2NameKr}</th>}
                                        {result[0].InfoCol3 !== undefined && <th className={styles.SearchItemNum}>{result[0].InfoCol3NameKr}</th>}
                                    </tr>
                                {result.map((Item, index) => (
                                    <tr className={styles.tableTr} key={index}>
                                        <td 
                                            className={styles.SearchItemNum}
                                        >
                                            {index + 1}
                                        </td>
                                        <td
                                            className={styles.SearchItem}
                                            style={{ width: Item.ColWidth ? Item.ColWidth+'px' : "auto" }}
                                            // onClick={() => searchClick(Item.Value, Item.ValueCode)}
                                            onClick={() =>
                                                searchClick(Item.Value, Item.ValueCode, {
                                                    InfoCol1: Item.InfoCol1,
                                                    InfoCol2: Item.InfoCol2,
                                                    InfoCol3: Item.InfoCol3
                                            })}
                                        >
                                            {Item.Value}
                                        </td>
                                        {Item.InfoCol1 !== undefined && Item.InfoCol1Width !== 0 && (
                                            <td
                                                className={styles.SearchItem}
                                                style={{ width: Item.InfoCol1Width }}
                                                // onClick={() => searchClick(Item.Value, Item.ValueCode)}
                                                onClick={() =>
                                                    searchClick(Item.Value, Item.ValueCode, {
                                                        InfoCol1: Item.InfoCol1,
                                                        InfoCol2: Item.InfoCol2,
                                                        InfoCol3: Item.InfoCol3
                                                })}
                                            >
                                                {Item.InfoCol1}
                                            </td>
                                        )}
                                        {Item.InfoCol2 !== undefined && Item.InfoCol2Width !== 0 && (
                                            <td
                                                className={styles.SearchItem}
                                                style={{ width: Item.InfoCol2Width }}
                                                // onClick={() => searchClick(Item.Value, Item.ValueCode)}
                                                onClick={() =>
                                                    searchClick(Item.Value, Item.ValueCode, {
                                                        InfoCol1: Item.InfoCol1,
                                                        InfoCol2: Item.InfoCol2,
                                                        InfoCol3: Item.InfoCol3
                                                })}
                                            >
                                                {Item.InfoCol2}
                                            </td>
                                        )}
                                        {Item.InfoCol3 !== undefined && Item.InfoCol3Width !== 0 && (
                                            <td
                                                className={styles.SearchItem}
                                                style={{ width: Item.InfoCol3Width }}
                                                // onClick={() => searchClick(Item.Value, Item.ValueCode)}
                                                onClick={() =>
                                                    searchClick(Item.Value, Item.ValueCode, {
                                                        InfoCol1: Item.InfoCol1,
                                                        InfoCol2: Item.InfoCol2,
                                                        InfoCol3: Item.InfoCol3
                                                })}
                                            >
                                                {Item.InfoCol3}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
  
}

export default SearchBox