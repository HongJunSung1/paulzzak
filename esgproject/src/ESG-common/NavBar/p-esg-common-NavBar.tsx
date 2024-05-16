import React from 'react'
import styles from './p-esg-common-NavBar.module.css'

import ImageLogo from '../../assets/image/logo.png';
import ImageSetting from '../../assets/image/setting.png';
import ImageUser from '../../assets/image/user.png';
import ImageAlarm from '../../assets/image/alarm.png';

const Navbar = () => {
    return (
        <div>
            <div className = {styles.NavBarContainer}>
                <div className = {styles.NavBarLeft}>
                    <div className = {styles.ImageLogoWrap}>
                        <img className = {styles.ImageLogo} src={ImageLogo}/>
                    </div>
                    <div className = {styles.MainTitle}>
                        ESG Data Platform
                    </div>
                </div>
                <div className = {styles.NavBarItem}>
                    <div className = {styles.search}>
                        <input type="text"></input>
                    </div>
                    <div className = {styles.ImageContainer}>
                        <div className = {styles.ImageWrap}>
                            <img className = {styles.ImageComponent} src={ImageAlarm}/>
                            <img className = {styles.ImageComponent} src={ImageSetting}/>
                            <img className = {styles.ImageComponent} src={ImageUser}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default Navbar;