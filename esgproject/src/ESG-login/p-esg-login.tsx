import React  from 'react';
import styles from './p-esg-login.module.css';
import { useNavigate  } from 'react-router-dom';

import OurLogo from '../assets/image/belly.png';
import EYLogo from '../assets/image/EYLogo.svg';
import LoginPicture from '../assets/image/LoginPicture.jpg';

const LoginPage = () => {

    const navigate = useNavigate();

    // 로그인 관련 sp를 탈 때는 여기서 sp 결과 불러와서 진행
    const goToMain = () => {
        navigate("/main");
    }

    return (
        <>
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
                                <input type="text" className = {styles.LoginInput} placeholder="사용자ID"></input>
                                <input type="text" className = {styles.LoginInput} placeholder="패스워드"></input>
                                <button className = {styles.LoginBtn} onClick={goToMain}>로그인</button>
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