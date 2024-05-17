import React, {useState}  from 'react';
import styles from './p-esg-login.module.css';

import OurLogo from '../assets/image/belly.png'
import EYLogo from '../assets/image/EYLogo.svg'
import LoginPicture from '../assets/image/LoginPicture.jpg'

const loginPage = () => {
    return (
        <>
            <div className = {styles.LoginContainer}>
                <div className = {styles.LoginWrap}>
                    <div className = {styles.LoginLeft}>
                        <div className = {styles.LoginLeftTop}>
                            <div className = {styles.OurLogo}>
                                <img className = {styles.OurLogo} src={OurLogo}/>
                            </div>
                            <div className = {styles.OurName}>뽈록앤뽈록</div>
                        </div>
                        <div>
                            <img className = {styles.LoginPicture} src={LoginPicture} />
                        </div>
                        <div className = {styles.LoginLeftBottom}>ESG Data Platform</div>
                        
                    </div>
                    <div className = {styles.LoginRight}>
                        <div className = {styles.LoginRightWrap}>
                            <div className={styles.EYLogoWrap}>
                                <img className = {styles.EYLogo} src={EYLogo}></img>
                            </div>
                            <div className={styles.LoginInputWrap}>
                                <input type="text" className = {styles.LoginInput} placeholder="사용자ID"></input>
                                <input type="text" className = {styles.LoginInput} placeholder="패스워드"></input>
                                <button className = {styles.LoginBtn}>로그인</button>
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

export default loginPage