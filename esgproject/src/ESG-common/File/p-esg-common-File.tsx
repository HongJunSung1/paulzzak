import React, {useState, useEffect} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-File.module.css';
import inputFileImg from '../../assets/image/file/InputFile.svg';
import fileSaveBtnImg from '../../assets/image/file/FileSaveBtn.svg';

let uploadFileData : any[] = [];

const File = () => {


    // 파일 등록 클릭 여부
    const [fileOpen, setFileOpen] = useState(false);
    
    const [fileUpload, setFileUpload] = useState<any>([]);
    
    // 파일 입력 요소에 대한 ref 생성
    const fileInput = React.useRef<any>(null);

    // 파일 업로드 버튼 클릭 시 파일 입력 요소 클릭 이벤트 발생
    const handleButtonClick = (e) => {
        if(fileInput.current){
            fileInput.current.click();
        }
    }

    useEffect(() => {
        setFileUpload([...uploadFileData])
        if(fileUpload.length > 0 ){
            setFileOpen(true);
        }
    }, [uploadFileData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
        if(e.target.files){
            const newFiles = Array.from(e.target.files) as File[];
            const uniqueFiles = newFiles.filter(
                newFile => !uploadFileData.some((existingFile: File) => (
                    existingFile.name === newFile.name && existingFile.size === newFile.size
                ))
            );
            uploadFileData = [...uploadFileData, ...uniqueFiles];
            setFileUpload([...uploadFileData]);
        }
    };

    // 파일 저장
    const handleSave = async () => {
        const formData = new FormData();
        uploadFileData.forEach(file => {
            formData.append('files', file);
        });

    
        try {
            const response = await fetch('http://localhost:9090/uploadFiles', {
                method: 'POST',
                body: formData,
            });
            console.log(response)
            if (response.ok) {
                console.log('파일 저장 성공');
            } else {
                console.error('파일 저장 실패', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function getFileSize(filesize) {
        var text = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(filesize) / Math.log(1024));
        return (filesize / Math.pow(1024, e)).toFixed(2) + " " + text[e];
    };

    return (
        <>
            <div className={styles.WholeContainer}>
                <div className={styles.InputContainer}>
                    <div className={styles.InputWrap} onClick={handleButtonClick}>
                        <img src={inputFileImg} alt="inputFileImg" className={styles.InputFileImg}/>
                        <button className={styles.FileButton}>파일첨부</button>
                        <input type="file" multiple={true} ref={fileInput} onChange ={handleChange} style={{display: "none"}}/>
                    </div>
                    <div className={styles.InputWrap} onClick={handleSave}>
                        <img src={fileSaveBtnImg} alt="fileSaveBtnImg" className={styles.InputFileImg}/>
                        <button className={styles.FileButton}>파일저장</button>
                    </div>
                </div>
                <div className={styles.FileTableContainer}>
                    <table>
                        <thead className={styles.FileTableHead}>
                            <tr>
                                <th>파일명</th>
                                <th>확장자</th>
                                <th>크기</th>
                                <th>다운로드</th>
                                <th>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileOpen &&
                                fileUpload.map((item, index) => (
                                        <tr key={index}>
                                            <td className={styles.FileName}>{item.name}</td>
                                            <td className={styles.FileSource}>{item.name.substr(item.name.lastIndexOf('.') + 1, )}</td>
                                            <td className={styles.FileVolume}>{getFileSize(item.size)}</td>
                                            <td className={styles.FileDownload}>
                                                <button className={styles.DownloadBtn}>다운로드</button>
                                            </td>
                                            <td className={styles.FileDelete}>
                                                <button className={styles.DeleteBtn}>삭제</button>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default File;