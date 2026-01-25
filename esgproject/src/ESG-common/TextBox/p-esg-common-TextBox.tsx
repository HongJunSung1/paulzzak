import React, {useState, useEffect} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-TextBox.module.css';


const TextBox = (settings : any) => {
    const [text, setText] = useState(settings.value || '');
    const [isReadOnly] = useState(settings.readOnly || false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);
    
    useEffect(() => {
        setText(settings.value || '');
    }, [settings.value]);

    const changeText = (e: any) => {
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
                    <input
                    className={styles.Input}
                    type="text"
                    style={{
                        width: isMobile
                        ? 200                      // 모바일은 무조건 200
                        : settings.width ?? 200    // PC는 입력 값, 없으면 200
                    }}
                    onChange={changeText}
                    value={text}
                    readOnly={settings.readOnly === true}
                    />
                    {!isReadOnly &&
                        <button className={styles.BtnClear} onClick={RemoveText} style={{display: text.length > 0 ? "inline-block" : "none"}}></button>
                    }
                </div>
            </div>
        </>
        
    ) 
}


export default TextBox