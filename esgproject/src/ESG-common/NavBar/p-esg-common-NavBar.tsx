import React,{useEffect, useRef, useState} from 'react'
import styles from './p-esg-common-NavBar.module.css'
import '../../global.d.ts';

import ImageLogo from '../../assets/image/logo.png';
import ImageSetting from '../../assets/image/setting.png';
import ImageUser from '../../assets/image/user.png';
import ImageAlarm from '../../assets/image/alarm.png';

import { useNavigate  } from 'react-router-dom';
import { SP_Request } from '../../hooks/sp-request.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
import cookie from 'react-cookies';

const Navbar = ({strOpenUrl,gohome}) => {

    const navigate = useNavigate()
    const [searchText,setSearchText] = useState('');
    const [resultData,setResultData] = useState<any>();
    const [isOpen,setIsOpen] = useState(false);
    const searchRef = useRef<any>(null);
    const { setMenuInfo } = useMenuInfo();

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

    const searchHandler = async (e) =>{
        setSearchText(e.target.value);

        if(searchText !== "" && e.currentTarget.value.trim() !== ""){
            const result = await SP_Request("S_ESG_FormSearch_Query",[{ FormName : e.currentTarget.value, DataSet : "DataSet1"}]);
            
            if(result[0].length > 0){
                setResultData(result[0]);
                setIsOpen(true);
            }else{
                setResultData([]);
                setIsOpen(false);
            }
        
        }else{
            setResultData([]);
            setIsOpen(false);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [searchRef]);

    
    const clickSearch = (formUrl) => {
        
        setSearchText('');
        setIsOpen(false);
        strOpenUrl("/" + formUrl);

        const data = cookie.load('menuList') || [];
        const filterData = data.filter((item => item.menuId === formUrl));

        setMenuInfo(filterData[0]);
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
                        <input type="text" className={styles.SearchInput} onChange={searchHandler} value={searchText}></input>
                        {isOpen && <div className = {styles.SearchWrap} ref={searchRef}>
                                {resultData.map((Item, index) => (
                                    <div className={styles.SearchItem} key={index} onClick={() => clickSearch(Item.FormUrl)}>{Item.FormName}</div>
                                ))}
                        </div>}
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