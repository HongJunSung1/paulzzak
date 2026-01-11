// 메세지 박스(확인)
import React from 'react';
import '../../global.d.ts';
import styles from './p-esg-common-MessageBox.module.css';

type MessageItem = {
  text: string;
};

type MessageBoxProps = {
  messageOpen: boolean;
  messageClose: () => void;
  MessageData?: MessageItem[];   // ✅ undefined 가능성 대비
  Title?: React.ReactNode;       // ✅ string/JSX 모두 허용
};


const MessageBox: React.FC<MessageBoxProps> = ({
  messageOpen,
  messageClose,
  MessageData = [],
  Title,
}) => {
  if (!messageOpen) return null;

  const realMessage: string[] = (MessageData ?? []).map((x) => x.text);

  return (
    <div className={styles.MessageContainer}>
      <div className={styles.MessageWrap}>
        <div className={styles.TitleWrap}>{Title}</div>

        <div className={styles.Message}>
          {realMessage.map((MsgItem, index) => (
            <div key={index}>{MsgItem}</div>
          ))}
        </div>

        <div className={styles.Footer}>
          <button className={styles.Button} onClick={messageClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;