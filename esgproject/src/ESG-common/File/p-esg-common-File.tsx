import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-File.module.css';
import inputFileImg from '../../assets/image/file/InputFile.svg';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import MessageBoxYesNo from '../../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

type CustomFileProps = {
    openUrl: any;
    source : any[];
    fileCD : any;
  };

// 메시지 박스
let message : any     = [];
let title   : string  = "";

const File = forwardRef(({openUrl, source, fileCD} : CustomFileProps, ref) => {
    
    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // YesNo메세지박스
    const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
    const messageYesNoClose = () => {setMessageYesNoOpen(false)};   
    const [deleteFileCD, setDeleteFileCD] = useState(0);

    // 파일 함수
    const fileRef = useRef(null);

    // 파일 등록 클릭 여부
    const [fileOpen, setFileOpen] = useState(false);
    
    // 파일 데이터 설정
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
            const limitFileSize = 10 * 1024 * 1024; // 파일 용량 제한 10MB
            const newFiles = Array.from(e.target.files) as File[];
            const uniqueFiles = newFiles.filter(
                newFile => !uploadFileData.some((existingFile: File) => (
                    existingFile.name === newFile.name && existingFile.size === newFile.size
                ))
            );
            for(let i=0; i< uniqueFiles.length; i++){
                if(uniqueFiles[i].size > limitFileSize){
                    let errMsg : any[] = [];
                    errMsg.push({text: "업로드 용량은 10MB를 넘을 수 없습니다."})
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "파일 업로드 오류";
                    return;
                }
            }
            setUploadFileData([...uploadFileData, ...uniqueFiles]);
            setFileUpload([...uploadFileData]);
        }
    };



    // 공통 함수
    useImperativeHandle(ref, () => ({
        // 파일 저장
        handleSave : async () => {

            // 저장할 데이터가 있을 때만 진행
            if(uploadFileData.length > 0){

                const formData = new FormData();
                fileUpload.forEach(file => {
                    formData.append('files', file);
                });

                // 화면 주소 추가
                formData.append('openUrl', openUrl ?  openUrl.substr(1) : '');
                try {
                    const response = await fetch('http://43.203.127.56:9090/ESGbbollock/uploadFiles', {
                    // const response = await fetch('http://localhost:9090/uploadFiles', {
                        method: 'POST',
                        body: formData,
                    });
        
                    if (response.ok) {
                        const result = await response.json();
                        return result;
                    } else {
                        console.error('파일 저장 실패', response.statusText);
                        return null;
                    }
                } catch (error) {
                    console.error('Error:', error);
                }

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
            // 파일 삭제 메세지 체크로직
            let errMsg : any[] = [];
            errMsg.push({text: item.name + " 파일을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."});
            message = errMsg;
            title   = "삭제 확인";
            setMessageYesNoOpen(true);
            setDeleteFileCD(item.FileCD);
        }
    }

    
    // 삭제 YES 버튼 클릭 시 삭제 로직 수행
    const messageYes = () => {
        setTimeout(() => {
            handleDelete(deleteFileCD);
            messageYesNoClose();
        }, 100)
    }; 

    // 파일 다운로드
    const handleDownload = async (FileCD) => {
        try {
            // 조회 SP 호출 후 결과 값 담기
            const result = await SP_Request("S_ESG_COM_FileDown_Query", [{FileCD: FileCD, DataSet: "DataSet1"}]);
            if(result[0].length > 0){
                // 결과값이 있을 경우
                try{
                    const formData = new FormData();
                    formData.append('fileName', result[0][0].uuidFileName);
                    formData.append('filePath', result[0][0].filePath);

                    // const fetchPath = "http://localhost:9090/download/";
                    const fetchPath = "http://43.203.127.56:9090/ESGbbollock/download/"
                    const response = await fetch(fetchPath, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = result[0][0].originalFileName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);    

                } catch(error){
                    // 로컬에 파일 저장할 때 발생한 에러 처리 로직
                    let errMsg : any[] = [];
                    errMsg.push({text: "[저장오류] 해당 파일이 존재하는지 다시 한 번 확인해주세요."})
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "저장 에러";
                    console.log(error);
                }
            } else{
                // 결과값이 없을 경우 처리 로직
                let errMsg : any[] = [];
                errMsg.push({text: "저장된 파일이 없습니다."})
                setMessageOpen(true);
                message = errMsg;
                title   = "저장 에러";
                return;
            }
        } catch (error) {
            // SP 호출 시 에러 처리 로직
            console.log(error);
        }
    }

    const handleDelete = async (FileCD) => {
        try {
            // 조회 SP 호출 후 결과 값 담기
            const spResult = await SP_Request("S_ESG_COM_FileDown_Query", [{FileCD: FileCD, DataSet: "DataSet1"}]);
            const formData = new FormData();

            if(spResult[0].length > 0){
                formData.append('fileName', spResult[0][0].uuidFileName);
                formData.append('filePath', spResult[0][0].filePath);

            }
            // const response = await fetch('http://localhost:9090/deleteFile', {
            const response = await fetch('http://43.203.127.56:9090/ESGbbollock/deleteFile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            // 서버에서 삭제 성공 시 로직
            if(response.ok){
                
                const delResult = await SP_Request("S_ESG_COM_FileDown_Cut", [{FileCD: FileCD, DataSet: "DataSet1"}]);

                if(delResult){
                    // 삭제한 파일을 기존 source 배열에서 없애주기
                    for(let i=0; i < source.length; i++){
                        if(source[i].FileCD === FileCD){
                            source.splice(i,1);
                        }
                    }
                    // 파일 리스트에서 삭제
                    setFileUpload([...uploadFileData, ...source]);
                    
                    // 실제 화면에 삭제한 fileCD 값 넘겨주기
                    fileCD(FileCD);
                }
            }
            
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };    

    return (
        <>
            <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {messageYes} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
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
                                                    {item.FileCD && <button className={styles.DownloadBtn} onClick={() => handleDownload(item.FileCD)}>다운로드</button>}                                                
                                                    {!item.FileCD && <div></div>}
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