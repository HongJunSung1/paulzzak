import React, {useState, useEffect} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-TextBox.module.css';


const TextBox = (settings : any) => {
    const [text, setText] = useState(settings.value || '');
    const [isReadOnly, setIsReadOnly] = useState(settings.readOnly || false);

    useEffect(() => {
        setText(settings.value || '');
    }, [settings.value]);

    const changeText = (e) => {
        setText(e.target.value);
        if (settings.onChange) {
            settings.onChange(e.target.value);
        }
    };

    const RemoveText = () => {
        setText('');
        if (settings.onChange) {
            settings.onChange('');
        }
    };
    

    return(
        <>
            <div className={styles.TextBoxWrap}>
                <div className={styles.TextBoxTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : 'Default'}</div>
                <div className={styles.InputWrap}>
                    <input className={styles.Input} type="text" style={{width: settings.width? settings.width : 200}} onChange={changeText} value={text} readOnly={settings.readOnly === true}></input>  
                    {!isReadOnly &&
                        <button className={styles.BtnClear} onClick={RemoveText} style={{display: text.length > 0 ? "inline-block" : "none"}}></button>
                    }
                </div>
            </div>
        </>
        
    ) 
}


export default TextBox