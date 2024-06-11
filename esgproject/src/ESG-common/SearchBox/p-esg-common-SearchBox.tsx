import React,{ useRef,useState, useEffect} from 'react'

import styles from './p-esg-common-SearchBox.module.css';
import { SP_Request } from '../../hooks/sp-request.tsx';


const SearchBox = (settings : any) => {

    const [text, setText] = useState(settings.value || '');
    const [result, setResult] = useState<any>();
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setText(settings.value || '');
    }, [settings.value]);

    const changeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        if (settings.onChange) {
            settings.onChange(e.target.value);
        }
    };

    const onkeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) =>{
        setResult([]);
        if(e.key === 'Enter'){
            if(text !== "" && e.currentTarget.value.trim() !== ""){
                const resultData = await SP_Request("S_ESG_SearchBox_Query",[{SearchCode : settings.searchCode , Text : e.currentTarget.value, DataSet : "DataSet1"}]);
                setResult(resultData[0]);

                setTimeout(()=>{
                    setIsOpen(true);
                },100)
            }
        }
    }

    const searchClick = (value) => {
        setText(value);
        if (settings.onChange) {
            settings.onChange(value);
        }
        
        setIsOpen(false);
    }
    
    const ClickHandler = async () =>{
        const resultData = await SP_Request("S_ESG_SearchBox_All_Query",[{SearchCode : settings.searchCode , DataSet : "DataSet1"}]);
        setResult(resultData[0]);
        
        if(isOpen){
            setIsOpen(false);
        }else{
            setIsOpen(true);    
        }
    }

    const RemoveText = () => {
        setIsOpen(false);
        setText('');
        if (settings.onChange) {
            settings.onChange('');
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



      return (
        <>
            <div ref={searchRef} className={styles.SearchBoxWrap}>
                {settings.name && <div className={styles.SearchBoxBoxTitle}>{settings.name}</div>}
                <div className={styles.InputWrap}>
                    <input
                        className={styles.Input}
                        type="text"
                        value={text}
                        style={{ width: settings.width ? settings.width : '100%' }}
                        onChange={changeText}
                        onKeyUp={onkeyUp}
                    />
                    {settings.name && (
                        <button
                            className={styles.BtnClear}
                            onClick={RemoveText}
                            style={{ display: text.length > 0 ? "block" : "none" }}
                        ></button>
                    )}
                    <div className={styles.SearchImg} onClick={ClickHandler} />
                </div>
                {isOpen && result.length > 0 && (
                        <table className={styles.SearchWrap} style={{width: result[0].TotSize+'px'}}>
                            <tbody>
                                    <tr>
                                        <th className={styles.SearchItemNum} style={{width:"25px"}}>no.</th>
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
                                            {index + 1}.
                                        </td>
                                        <td
                                            className={styles.SearchItem}
                                            style={{ width: Item.ColWidth ? Item.ColWidth+'px' : "auto" }}
                                            onClick={() => searchClick(Item.Value)}
                                        >
                                            {Item.Value}
                                        </td>
                                        {Item.InfoCol1 !== undefined && Item.InfoCol1Width !== 0 && (
                                            <td
                                                className={styles.SearchItem}
                                                style={{ width: Item.InfoCol1Width }}
                                                onClick={() => searchClick(Item.Value)}
                                            >
                                                {Item.InfoCol1}
                                            </td>
                                        )}
                                        {Item.InfoCol2 !== undefined && Item.InfoCol2Width !== 0 && (
                                            <td
                                                className={styles.SearchItem}
                                                style={{ width: Item.InfoCol2Width }}
                                                onClick={() => searchClick(Item.Value)}
                                            >
                                                {Item.InfoCol2}
                                            </td>
                                        )}
                                        {Item.InfoCol3 !== undefined && Item.InfoCol3Width !== 0 && (
                                            <td
                                                className={styles.SearchItem}
                                                style={{ width: Item.InfoCol3Width }}
                                                onClick={() => searchClick(Item.Value)}
                                            >
                                                {Item.InfoCol3}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                )}
            </div>
        </>
    );
  
}

export default SearchBox