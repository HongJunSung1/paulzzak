import React, {useRef} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-File.module.css';
import inputFileImg from '../../assets/image/file/InputFile.svg';

const File = () => {

    // 파일 입력 요소에 대한 ref 생성
    const fileInput = React.useRef<any>(null);

    // 파일 업로드 버튼 클릭 시 파일 입력 요소 클릭 이벤트 발생
    const handleButtonClick = (e) => {
        if(fileInput.current){
            fileInput.current.click();
        }
    }

    const handleChange = (e) => {
        // 선택한 파일 정보를 콘솔에 출력
        console.log(e.target.files[0]);
    }

    return (
        <>
            <div className={styles.WholeContainer}>
                <div className={styles.InputContainer}>
                    <div className={styles.InputWrap} onClick={handleButtonClick}>
                        <img src={inputFileImg} alt="inputFileImg" className={styles.InputFileImg}/>
                        <button className={styles.FileButton}>파일첨부</button>
                        <input type="file" multiple={true} ref={fileInput} onChange={handleChange} style={{display: "none"}}/>
                    </div>
                </div>
                <div className={styles.FileWrap}>파일첨부</div>
            </div>
        </>
    )
}

export default File;