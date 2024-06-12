import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-dialogue.module.css'
import {useSpring, animated} from 'react-spring';
import {useDrag} from 'react-use-gesture';

const Dialogue = ({children, DlgName, isOpenDlg, Dlgwidth, Dlgheight , setIsOpen}) => {
    const logoPos = useSpring({x:0, y:0});

    const bindLogoPos = useDrag((params)=>{
        logoPos.x.set(params.offset[0]);
        logoPos.y.set(params.offset[1]);
      });

    const closeDlg = () => {
        setIsOpen(false);
    };

    
    return (
        isOpenDlg &&
        <div className={styles.DialogueWarp}>
            <animated.div className={styles.Dialogue} style={{width : Dlgwidth? Dlgwidth : "600px", height: Dlgheight ? Dlgheight : "500px",
                x: logoPos.x,
                y: logoPos.y,
                cursor: 'Default'
            }}>
                <div className ={styles.DlgHeader} {...bindLogoPos()}>
                    <div className={styles.DlgName}>{DlgName}</div>
                    <div className={styles.CloseBtn} onClick={closeDlg}/>
                </div>
                <div className ={styles.DlgContent} style={{width : Dlgwidth? Dlgwidth : "600px", height: Dlgheight ? Dlgheight - 25 : "475px"}}>
                    {children}
                </div>
            </animated.div>
        </div>
    )
} 

export default Dialogue;