import React,{ useState, useEffect} from 'react'

import styles from './p-esg-common-SearchBox.module.css';
import { SP_Request } from '../../hooks/sp-request.tsx';
import ListIcon from '../../assets/image/ListIcon.svg';


const SearchBox = (settings : any) => {

    const [text, setText] = useState(settings.value || '');
    const [result, setResult] = useState<any>();
    const [isOpen, setIsOpen] = useState(false);

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
    
    return (
        <>
            <div className={styles.SearchBoxWrap}>
                <div className={styles.SearchBoxBoxTitle}>{settings.Title ? settings.Title : "서치박스명"}</div>
                <div className={styles.InputWrap}>
                    <input className={styles.Input} type="text" value={text} style={{width: settings.width? settings.width : 200}} onChange={changeText}></input>
                    <button className={styles.BtnClear} onClick={RemoveText} style={{display: text.length > 0 ? "block" : "none"}}></button>
                    <img className={styles.SearchImg} src={ListIcon} alt={`${ListIcon}`} onClick={ClickHandler}/>
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