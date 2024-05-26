import React, { useState }  from 'react';
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

    const [loading,setLoading] = useState(false);

    // 아이디, 비밀번호 변수 설정
    const [userID,setUserID] = useState('');
    const [userPW,setUserPW] = useState(''); 

    const inputID = event => {
        setUserID(event.target.value);
    }

    const inputPW = event => {
        setUserPW(event.target.value);
    }


    // 로그인 SP 결과
    let result : any;


    //로그인 체크 및 함호화
    const loginCheck = () => {
        setLoading(true);// 로딩창 시작
        if (userID === null || userID === ""){
            window.alert("아이디를 입력해주세요.");
            setLoading(false);// 로딩창 종료
            return;
        }else if (userPW === null || userPW === ""){
            window.alert("비밀번호를 입력해주세요.");
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
            setLoading(false);// 로딩창 종료
            window.alert(result[0][0].Message);
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
                            <div className={styles.LoginInputWrap}>
                                <input type="text" className = {styles.LoginInput} placeholder="사용자ID" value={userID} onChange={inputID}></input>
                                <input type="password" className = {styles.LoginInput} placeholder="패스워드" value={userPW} onChange={inputPW}></input>
                                <button className = {styles.LoginBtn} onClick={loginCheck}>로그인</button>
                            </div>
                            <div className={styles.copyright}>
                                Copyright © 2024.Bblock. All rights reserved
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default LoginPage