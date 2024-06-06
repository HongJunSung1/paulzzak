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

    const changeText = async (e) => {
        setText(e.target.value);
        setIsOpen(true);

        if(text !== ""){
            const result = await SP_Request("S_ESG_SearchBox_Query",[{SearchCode : settings.searchCode , Text : e.target.value, DataSet : "DataSet1"}]);
            setResult(result[0]);
        }

        if (settings.onChange) {
            settings.onChange(e.target.value);
        }
    };

    const searchClick = (value) => {
        setText(value);
        if (settings.onChange) {
            settings.onChange(value);
        }
        setIsOpen(false);
    }
    
    const ClickHandler = async () =>{
        const result = await SP_Request("S_ESG_SearchBox_All_Query",[{SearchCode : settings.searchCode , DataSet : "DataSet1"}]);
        setResult(result[0]);

        if(isOpen){
            setIsOpen(false);
        }else{
            setIsOpen(true);
        }
    }

    const RemoveText = () => {
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
                <div className={styles.SearchBoxBoxTitle}>{settings.name ? settings.name : "서치박스명"}</div>
                <div className={styles.InputWrap}>
                    <input className={styles.Input} type="text" value={text} style={{width: settings.width? settings.width : 200}} onChange={changeText}></input>
                    <button className={styles.BtnClear} onClick={RemoveText} style={{display: text.length > 0 ? "block" : "none"}}></button>
                    {/* <img className={styles.SearchImg} src={ListIcon} alt={`${ListIcon}`} onClick={ClickHandler}/> */}
                    <div className={styles.SearchImg} onClick={ClickHandler}/>
                </div>
                {isOpen &&<div className={styles.SearchWrap} style={{width: settings.width? settings.width : 200}}>
                    {result && result.map((Item, index) =>
                        <div className={styles.SearchItem} key={index} onClick={() => searchClick(Item.Value)} >{index + 1}. {Item.Value}</div>
                    )}
                </div>
                }
            </div>
        </>
    )
  
}

export default SearchBox