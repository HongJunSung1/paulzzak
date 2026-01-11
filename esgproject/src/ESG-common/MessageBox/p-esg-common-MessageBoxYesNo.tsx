import React from 'react';
import '../../global.d.ts';
import styles from './p-esg-common-MessageBox.module.css';

type MessageItem = {
  text: string;
};

type MessageBoxYesNoProps = {
  messageYesNoOpen: boolean;
  btnYes: () => void;
  btnNo: () => void;
  MessageData?: MessageItem[];  // ✅ undefined 가능 대비
  Title?: React.ReactNode;      // ✅ 문자열/JSX 모두 허용
};

const MessageBoxYesNo: React.FC<MessageBoxYesNoProps> = ({
  messageYesNoOpen,
  btnYes,
  btnNo,
  MessageData = [],
  Title,
}) => {
  if (!messageYesNoOpen) return null;

  const realMessage = MessageData.map((m) => m.text);

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
          <button
            type="button"
            className={styles.ButtonYesNo}
            onClick={btnYes}
          >
            확인
          </button>
          <button
            type="button"
            className={styles.ButtonYesNo}
            onClick={btnNo}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBoxYesNo;