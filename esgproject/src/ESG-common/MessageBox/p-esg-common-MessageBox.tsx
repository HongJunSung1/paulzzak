// 메뉴 등록
import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-MessageBox.module.css';

const MessageBox = ({messageOpen, messageClose, MessageData, Title}) => {
    if(messageOpen === true) {
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
                        <button className={styles.Button} onClick={messageClose}>
                            확인
                        </button>
                    </div>
                </div>
            </>
        )   
    }
}

export default MessageBox;