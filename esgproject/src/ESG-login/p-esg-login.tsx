import React, { useState, useRef}  from 'react';
import styles from './p-esg-login.module.css';
import { useNavigate  } from 'react-router-dom';

import OurLogo from '../assets/image/belly.png';
import EYLogo from '../assets/image/EYLogo.svg';
import LoginPicture from '../assets/image/LoginPicture.jpg';
import Loading from '../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import MessageBoxYesNo from '../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';
import MessageBox from '../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';

import { SP_Request } from '../hooks/sp-request.tsx';
import SHA256 from 'crypto-js/sha256';
import cookie from 'react-cookies';
import emailjs from '@emailjs/browser';

// 메시지 박스
let message : any     = [];
let title   : string  = "";

const LoginPage = () => {

    // 쿠키 삭제
    cookie.remove('userInfo', {path : '/'});
    // cookie.remove('menuList', {path : '/'});
    // cookie.remove('LmenuList', {path : '/'});

    // sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('menuList');
    sessionStorage.removeItem('LmenuList');


    const navigate = useNavigate();

    // 에러메세지
    const [errMsg, setErrMsg] = useState('');

    //로딩바
    const [loading,setLoading] = useState(false);

    // 비밀번호 초기화 버튼
    const [isPassWord, setPassword] = useState(false);

    // 비밀번호 초기화(이메일 양식)
    const [userInfoCheck, setInfo] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};    

    // YesNo메세지박스
    const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
    const messageYesNoClose = () => {setMessageYesNoOpen(false)}; 

    // 아이디, 비밀번호 변수 설정
    const [userID,setUserID] = useState('');
    const [userPW,setUserPW] = useState(''); 
    const [userPWCheck,setUserPWCheck] = useState(''); 
    const [userPWOrigin,setUserPWOrigin] = useState('');

    // 아이디,비밀번호 입력창 포커스
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const passwordChangeInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);
    const idChangeInputRef = useRef<HTMLInputElement>(null);

    const inputID = event => {
        setUserID(event.target.value);
    }

    const inputPW = event => {
        setUserPW(event.target.value);
    }

    const inputPWCheck = event => {
        setUserPWCheck(event.target.value);
    }

    const inputOriginPW = event => {
        setUserPWOrigin(event.target.value);
    }


    // 로그인 SP 결과
    let result : any;

    const activeEnter = (e) => {
        if(e.key === "Enter") {
            loginCheck();
        }
    }

    const activeChangeEnter = (e) => {
    if(e.key === "Enter") {
        passwordChange();
    }
    }

    //로그인 체크 및 함호화
    const loginCheck = () => {
        setLoading(true);// 로딩창 시작
        if (userID === null || userID === ""){
            setErrMsg("아이디를 입력해주세요.");
            setLoading(false);// 로딩창 종료
            return;
        }else if (userPW === null || userPW === ""){
            setErrMsg("비밀번호를 입력해주세요.");
            setLoading(false);// 로딩창 종료
            return;
        }

        goToMain();
    }

    // 로그인 SP 호출
    const goToMain = async () => {

        const cryptoPW = SHA256(userPW).toString();
        const checkPW = SHA256('1234').toString();

        try {
            result = await SP_Request("S_ESG_LoginCheck", [{userID, cryptoPW, checkPW, DataSet: 'DataSet'}]);
        } catch (error) {
            console.log(error);
        }
        if(result !== null && result[0][0].Status === "0"){
            // 로그인 정보 쿠키 저장
            const expires = new Date();
            expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));   // 로그인 유지 시간 24시간
            cookie.save('userInfo', result[0][0], {
                path : '/',
                expires,
                secure : true,
                domain: 'esgplatform.co.kr',
                // httpOnly : true
            });
            // sessionStorage.setItem('userInfo',JSON.stringify(result[0][0]));
            // console.log(cookie.load('userid'));

            try{
                const menuResult = await SP_Request("S_ESG_MenuList",[{ UserCD : result[0][0].UserCD , DataSet : 'DataSet'}]);
                if(menuResult !== null && menuResult.length > 0){
                    sessionStorage.setItem('menuList',JSON.stringify(menuResult[0]));
                    sessionStorage.setItem('LmenuList',JSON.stringify(menuResult[1]));
                    // cookie.save('menuList',menuResult[0],{
                    //     path : '/',
                    //     expires,
                    //     secure : true   
                    // });
                    // cookie.save('LmenuList',menuResult[1],{
                    //     path : '/',
                    //     expires,
                    //     secure : true   
                    // });
                    setTimeout(()=>{
                        setLoading(false);// 로딩창 종료
                        navigate("/main");// 메인 화면 이동
                    },500)
                }else{
                    setLoading(false);// 로딩창 종료
                    navigate("/");// 로그인 이동
                }
            }catch (e){
                console.log(e);
            }

        }else{
            switch(result[0][0].Status){

                //초기화 비밀번호 노출 시 비밀번호 변경 창으로 자동 이동
                case "1" :
                    setUserPW("");
                    setErrMsg(result[0][0].Message);
                    setLoading(false)
                    setInfo(true);
                break;

                //아이디 오류 : 900
                case "900" :
                    setUserID("");
                    setUserPW("");
                    setLoading(false);// 로딩창 종료
                    setPassword(false); // 비밀번호 초기화 버튼 없애기
                    setErrMsg(result[0][0].Message);
                    if(idInputRef.current){
                        idInputRef.current.focus();// 아이디 입력 필드에 포커스
                    }
                break;

                //비밀번호 오류 : 901
                case "901" : 
                    setUserPW("");
                    setLoading(false);// 로딩창 종료
                    setPassword(true);// 비밀번호 초기화 화면 생성
                    setErrMsg(result[0][0].Message);
                    if (passwordInputRef.current) {
                        passwordInputRef.current.focus(); // 비밀번호 입력 필드에 포커스
                    }
                break;

                default:
                    setLoading(false); // 로딩창 종료
                    setErrMsg("로그인에 실패했습니다. 다시 시도해주세요.");
                break;
            }
        }
    }

    // 비밀번호 초기화 로직
    const initPasswordMsg = () => {
        let errMsg : any[] = [];
        errMsg.push({text: userID + " 의 비밀번호를 변경하시겠습니까? 확인 클릭 시 등록된 이메일로 임시 비밀번호가 전송됩니다."});
        message = errMsg;
        title   = "삭제 확인";
        setMessageYesNoOpen(true);
    }

    // 비밀번호 이메일 발송 양식
    const initPassword = async () => {
        messageYesNoClose();
        setErrMsg('');
        // 비밀번호 변경
        const newPW = Math.random().toString(36).substring(2, 11);
        const cryptoPW = SHA256(newPW).toString();
        try {
            result = await SP_Request("S_ESG_LoginPasswordInit", [{userID, cryptoPW, DataSet: 'DataSet'}]);
            if(result){
                setInfo(true);

                // 이메일로 비밀번호 보내기
                emailjs.send('service_m53l826','template_icrfdxr',{
                    to_id: result[0][0].userID,
                    newPW: newPW,
                    to_email: result[0][0].Email
                },{publicKey : "s4ZPyCNiNvQvTYxtZ"})
                    .then(
                        (response) => {
                            console.log('성공',response.status);
                            let errMsg : any[] = [];
                            errMsg.push({text: "임시 비밀번호가 " + userID + "에 등록된 이메일로 전송되었습니다. 이메일 확인 후 즉시 비밀번호를 변경해주세요."});
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "비밀번호 변경";                                
                        },
                        (error) => {
                            console.log('실패', error);
                        },
                    );
            } else{
                let errMsg : any[] = [];
                errMsg.push({text: "비밀번호 변경 실패"})
                setMessageOpen(true);
                message = errMsg;
                title   = "비밀번호 에러";                
            }
        } catch (error) {
            console.log(error);
        }
    }

    const passwordChange = async () => {
        const cryptoPWOrigin = SHA256(userPWOrigin).toString();
        const cryptoPW = SHA256(userPW).toString();

        if(userPW !== userPWCheck){
            setErrMsg("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            result = await SP_Request("S_ESG_LoginPasswordChange", [{userID, cryptoPWOrigin, cryptoPW, DataSet: 'DataSet'}])

            if(result !== null && result[0][0].Status === "0"){
                let errMsg : any[] = [];
                errMsg.push({text: "비밀번호 변경이 완료 되었습니다."});
                setMessageOpen(true);
                message = errMsg;
                title   = "비밀번호 변경";              
                setInfo(false);
                setErrMsg('');
                setUserPWOrigin('');
                setUserPW('');
                setUserPWCheck('');

            } else{
                switch(result[0][0].Status){
                    //아이디 오류 : 900
                    case "900" :
                        setErrMsg(result[0][0].Message);
                        if(idChangeInputRef.current){
                            idChangeInputRef.current.focus();// 아이디 입력 필드에 포커스
                        }                       

                    break;
    
                    //비밀번호 오류 : 901
                    case "901" : 
                        setErrMsg(result[0][0].Message);
                        if (passwordChangeInputRef.current) {
                            passwordChangeInputRef.current.focus(); // 비밀번호 입력 필드에 포커스
                        }
                    break;

                    //비밀번호 오류 : 902
                    case "902" : 
                        setErrMsg(result[0][0].Message);
                        if (passwordChangeInputRef.current) {
                            passwordChangeInputRef.current.focus(); // 비밀번호 입력 필드에 포커스
                        }
                    break;

                    default:
                        setLoading(false); // 로딩창 종료
                        setErrMsg("로그인에 실패했습니다. 다시 시도해주세요.");
                    break;
                }
            }
        } catch(error){
            console.log(error);
        }
    }

    return (
        <>
            <Loading loading={loading}/>
            <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {initPassword} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <div className = {styles.LoginContainer}>
                <div className = {styles.LoginWrap}>
                    <div className = {styles.LoginLeft}>
                        <div className = {styles.LoginLeftTop}>
                            <div className = {styles.OurLogo}>
                                <img className = {styles.OurLogo} src={OurLogo} alt={"OurLogo"}/>
                            </div>
                            <div className = {styles.OurName}>뽈록앤뽈록</div>
                        </div>
                        <div>
                            <img className = {styles.LoginPicture} src={LoginPicture} alt={"LoginPicture"}/>
                        </div>
                        <div className = {styles.LoginLeftBottom}>ESG Data Platform</div>
                        
                    </div>
                    <div className = {styles.LoginRight}>
                        <div className = {styles.LoginRightWrap}>
                            <div className={styles.EYLogoWrap}>
                                <img className = {styles.EYLogo} src={EYLogo} alt={"EYLogo"}></img>
                            </div>
                            {!userInfoCheck && 
                            <div>
                                <div className={styles.LoginInputWrap}>
                                    <input type="text" className = {styles.LoginInput} placeholder="사용자ID" value={userID} onChange={inputID} onKeyDown={(e) => activeEnter(e)} ref={idInputRef}></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="패스워드" value={userPW} onChange={inputPW} onKeyDown={(e) => activeEnter(e)} ref={passwordInputRef} autoComplete="off"></input>
                                    <div className={styles.loginAlert}>{errMsg}</div>
                                    <button className = {styles.LoginBtn} onClick={loginCheck}>로그인</button>
                                    {isPassWord && <div className = {styles.initPassword} onClick={initPasswordMsg}>비밀번호 초기화</div>}
                                </div>
                                <div className={styles.copyright}>
                                    Copyright © 2024.Bblock. All rights reserved
                                </div>
                            </div>
                            }
                            {userInfoCheck && 
                            <div>
                                <div className={styles.LoginInputWrapChange}>
                                    <input type="text" className = {styles.LoginInput} placeholder="사용자ID" value={userID} onChange={inputID} onKeyDown={(e) => activeChangeEnter(e)} ref={idChangeInputRef}></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="현재 비밀번호" value={userPWOrigin} onChange={inputOriginPW} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef} autoComplete="off"></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="새 비밀번호" value={userPW} onChange={inputPW} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef} autoComplete="off"></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="새 비밀번호 확인" value={userPWCheck} onChange={inputPWCheck} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef} ></input>
                                    <div className={styles.loginAlert}>{errMsg}</div>
                                    <button className = {styles.LoginBtn} onClick={passwordChange}>비밀번호 변경</button>
                                </div>
                                <div className={styles.copyrightSub}>
                                    Copyright © 2024.Bblock. All rights reserved
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default LoginPage