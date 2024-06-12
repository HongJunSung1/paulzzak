// 메세지 박스(YesNo)
import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-MessageBox.module.css';

const MessageBoxYesNo = ({messageYesNoOpen, btnYes, btnNo, MessageData, Title}) => {
    if(messageYesNoOpen === true) {
        let realMessage : any[] = [];
        for(let i = 0; i < MessageData.length; i++){
           realMessage.push(MessageData[i].text)
        }
        return (
            <>
                <div className={styles.MessageContainer}>
                    <div className={styles.MessageWrap}>
                        <div className={styles.TitleWrap}>
                            {Title}
                        </div>
                        <div className={styles.Message}>
                            {realMessage.map((MsgItem, index) => {
                                return (
                                    <div key={index}>{MsgItem}</div>
                                )
                            })}
                        </div>
                        <button className={styles.ButtonYesNo} onClick={btnYes}>
                            확인
                        </button>
                        <button className={styles.ButtonYesNo} onClick={btnNo}>
                            취소
                        </button>
                    </div>
                </div>
            </>
        )   
    }
}

export default MessageBoxYesNo;