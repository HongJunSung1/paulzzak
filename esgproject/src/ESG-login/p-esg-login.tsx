import React, { useState, useRef}  from 'react';
import styles from './p-esg-login.module.css';
import { useNavigate  } from 'react-router-dom';

import OurLogo from '../assets/image/belly.png';
import EYLogo from '../assets/image/EYLogo.svg';
import LoginPicture from '../assets/image/LoginPicture.jpg';
import Loading from '../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';

import { SP_Request } from '../hooks/sp-request.tsx';
import {SHA256} from 'crypto-js';
import cookie from 'react-cookies';

const LoginPage = () => {

    // 쿠키 삭제
    cookie.remove('userid', {path : '/'},1000);

    const navigate = useNavigate();

    // 에러메세지
    const [errMsg, setErrMsg] = useState('');

    //로딩바
    const [loading,setLoading] = useState(false);

    // 비밀번호 초기화 버튼
    const [isPassWord, setPassword] = useState(false);

    // 비밀번호 초기화(이메일 양식)
    const [userInfoCheck, setInfo] = useState(false);

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

        try {
            result = await SP_Request("S_ESG_LoginCheck", [{userID, cryptoPW}]);
        } catch (error) {
            console.log(error);
        }
        if(result !== null && result[0][0].Status === "0"){
            // 로그인 정보 쿠키 저장
            const expires = new Date();
            expires.setMinutes(expires.getMinutes() + 60)
            cookie.save('userid', result[0][0].userID, {
                path : '/',
                expires,
                secure : true
                // httpOnly : true
            });
            // console.log(cookie.load('userid'));

            setLoading(false);// 로딩창 종료
            navigate("/main");// 메인 화면 이동
        }else{
            switch(result[0][0].Status){

                //아이디 오류 : 900
                case "900" :
                    setUserID("");
                    setUserPW("");
                    setLoading(false);// 로딩창 종료
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

    // 비밀번호 이메일 발송 양식
    const initPassword = async () => {
        setErrMsg('');
        // 비밀번호 변경
        const cryptoPW = SHA256('1234').toString();
        try {
            result = await SP_Request("S_ESG_LoginPasswordInit", [{userID, cryptoPW}]);
            if(result){
                setInfo(true);
            } else{
                window.alert("비밀번호 변경 실패");
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
            result = await SP_Request("S_ESG_LoginPasswordChange", [{userID, cryptoPWOrigin, cryptoPW}])
            if(result !== null && result[0][0].Status === "0"){
                window.alert("비밀번호 변경 완료");
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
                                    <input type="password" className = {styles.LoginInput} placeholder="패스워드" value={userPW} onChange={inputPW} onKeyDown={(e) => activeEnter(e)} ref={passwordInputRef}></input>
                                    <div className={styles.loginAlert}>{errMsg}</div>
                                    <button className = {styles.LoginBtn} onClick={loginCheck}>로그인</button>
                                    {isPassWord && <div className = {styles.initPassword} onClick={initPassword}>비밀번호 초기화</div>}
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
                                    <input type="password" className = {styles.LoginInput} placeholder="현재 비밀번호" value={userPWOrigin} onChange={inputOriginPW} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef}></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="새 비밀번호" value={userPW} onChange={inputPW} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef}></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="새 비밀번호 확인" value={userPWCheck} onChange={inputPWCheck} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef}></input>
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