import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-dialogue.module.css'

const Dialogue = ({children, DlgName, isOpenDlg, Dlgwidth, Dlgheight , setIsOpen}) => {

    const closeDlg = () => {
        setIsOpen(false);
    };

    
    return (
        isOpenDlg &&
        <div className={styles.DialogueWarp}>
            <div className={styles.Dialogue} style={{width : Dlgwidth? Dlgwidth : "600px", height: Dlgheight ? Dlgheight : "500px"}}>
                <div className ={styles.DlgHeader}>
                    <div className={styles.DlgName}>{DlgName}</div>
                    <div className={styles.CloseBtn} onClick={closeDlg}/>
                </div>
                <div className ={styles.DlgContent} style={{width : Dlgwidth? Dlgwidth : "600px", height: Dlgheight ? Dlgheight - 25 : "475px"}}>
                    {children}
                </div>
            </div>
        </div>
    )
} 

export default Dialogue;