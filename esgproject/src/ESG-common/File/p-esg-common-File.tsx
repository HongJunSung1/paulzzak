import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-File.module.css';
import inputFileImg from '../../assets/image/file/InputFile.svg';

type CustomFileProps = {
    openUrl: any;
    source : any[];
  };


const File = forwardRef(({openUrl, source} : CustomFileProps, ref) => {

    const fileRef = useRef(null);

    // 파일 등록 클릭 여부
    const [fileOpen, setFileOpen] = useState(false);
    
    const [uploadFileData, setUploadFileData] = useState<any>([]);
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
        setTimeout(()=> {
            setFileOpen(uploadFileData.length > 0 || source.length > 0); 
        }, 100)
    }, [uploadFileData, source]);

    useEffect(() => {
        setTimeout(()=> {
            setFileUpload([...uploadFileData, ...source]);
        }, 100)
    }, [uploadFileData]);

    useEffect(() => {
        setTimeout(()=> {
            setFileUpload(source);
            setUploadFileData([]);
        }, 100)
    }, [source]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
        if(e.target.files){
            const newFiles = Array.from(e.target.files) as File[];
            const uniqueFiles = newFiles.filter(
                newFile => !uploadFileData.some((existingFile: File) => (
                    existingFile.name === newFile.name && existingFile.size === newFile.size
                ))
            );
            setUploadFileData([...uploadFileData, ...uniqueFiles]);
            setFileUpload([...uploadFileData]);
        }
    };



    // 공통 함수
    useImperativeHandle(ref, () => ({
        // 파일 저장
        handleSave : async () => {
            const formData = new FormData();
            fileUpload.forEach(file => {
                formData.append('files', file);
            });

            // 화면 주소 추가
            formData.append('openUrl', openUrl?.openUrl ?  openUrl.openUrl.substr(1) : '');
    
            try {
                const response = await fetch('http://localhost:9090/uploadFiles', {
                    method: 'POST',
                    body: formData,
                });
    
                if (response.ok) {
                    const result = await response.json();
                    console.log('파일 저장 성공');
                    return result;
                } else {
                    console.error('파일 저장 실패', response.statusText);
                    return null;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }))


    // 용량 표기
    function getFileSize(filesize) {
        var text = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(filesize) / Math.log(1024));
        return (filesize / Math.pow(1024, e)).toFixed(2) + " " + text[e];
    };

    // 파일 첨부 내역에서 삭제
    const deleteTempFile = (index, item) => {


        // 아직 실제 저장한 데이터가 아닌 이번에 새로 첨부한 데이터라면 바로 화면에서 삭제
        if(!item.FileCD){
            setUploadFileData(prevFiles => {
                const updatedFiles = prevFiles.filter((_, i) => i !== index);
                return updatedFiles;
            });
        } else{
            // 이미 저장한 데이터를 삭제했을 경우 
            const uniqueFiles = source.filter((_, i) => i === index);
            console.log(uniqueFiles);
        }

    }

    return (
        <>
            <div className={styles.WholeContainer} ref = {fileRef}>
                <div className={styles.InputContainer}>
                    <div className={styles.InputWrap} onClick={handleButtonClick}>
                        <img src={inputFileImg} alt="inputFileImg" className={styles.InputFileImg}/>
                        <button className={styles.FileButton}>파일첨부</button>
                        <input type="file" multiple={true} ref={fileInput} onChange ={handleChange} style={{display: "none"}}/>
                    </div>
                </div>
                <div className={styles.FileTableContainer}>
                    <table>
                        <thead className={styles.FileTableHead}>
                            <tr>
                                <th>파일코드</th>
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
                                            <td className={styles.FileCD}>{item.FileCD}</td>
                                            <td className={styles.FileName}>{item.name}</td>
                                            <td className={styles.FileSource}>{item.name.substr(item.name.lastIndexOf('.') + 1, )}</td>
                                            <td className={styles.FileVolume}>{getFileSize(item.size)}</td>
                                            <td className={styles.FileDownload}>
                                                <button className={styles.DownloadBtn}>다운로드</button>
                                            </td>
                                            <td className={styles.FileDelete}>
                                                <button className={styles.DeleteBtn} onClick={() => deleteTempFile(index, item)}>삭제</button>
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
)
export default File;