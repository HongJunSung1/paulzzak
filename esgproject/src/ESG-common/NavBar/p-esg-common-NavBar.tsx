import React,{useEffect} from 'react'
import styles from './p-esg-common-NavBar.module.css'
import '../../global.d.ts';

import ImageLogo from '../../assets/image/logo.png';
import ImageSetting from '../../assets/image/setting.png';
import ImageUser from '../../assets/image/user.png';
import ImageAlarm from '../../assets/image/alarm.png';

import { useNavigate  } from 'react-router-dom';
import cookie from 'react-cookies';

const Navbar = ({strOpenUrl,gohome}) => {

    const navigate = useNavigate()

    useEffect(() => {
        const isLogin = cookie.load('userInfo') !== undefined;
        if (!isLogin) {
            navigate("/"); // 기본 주소로 리다이렉트
        }
    }, [navigate]); 


    const goMain = () =>{
        strOpenUrl("/main");
        gohome(true);
    }
    
    return (
        <div>
            <div className = {styles.NavBarContainer}>
                    <div className = {styles.NavBarLeft} onClick={goMain}>
                        <div className = {styles.ImageLogoWrap}>
                            <img className = {styles.ImageLogo} src={ImageLogo} alt={"Logo"}/>
                        </div>
                        <div className = {styles.MainTitle}>
                            ESG Data Platform
                        </div>
                    </div>
                <div className = {styles.NavBarItem}>
                    <div className = {styles.search}>
                        <input type="text" className={styles.SearchInput}></input>
                    </div>
                    <div className = {styles.ImageContainer}>
                        <div className = {styles.ImageWrap}>
                            <img className = {styles.ImageComponent} src={ImageAlarm} alt={"Alarm"}/>
                            <img className = {styles.ImageComponent} src={ImageSetting} alt={"Setting"}/>
                            <img className = {styles.ImageComponent} src={ImageUser} alt={"User"}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default Navbar;