import React,{useEffect, useRef, useState} from 'react'
import styles from './p-esg-common-NavBar.module.css'
import '../../global.d.ts';

import ImageLogo from '../../assets/image/logo.png';
import ImageSetting from '../../assets/image/navbar-setting.png';
import ImageLogout from '../../assets/image/navbar-logout.png';

import MessageBoxYesNo from '../../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';

import { useNavigate  } from 'react-router-dom';
import { SP_Request } from '../../hooks/sp-request.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
import cookie from 'react-cookies';

// 메시지 박스
let message : any     = [];
let title   : string  = "";


const data = cookie.load('menuList') || [];

const Navbar = ({strOpenUrl}) => {

    // YesNo메세지박스
    const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
    const messageYesNoClose = () => {setMessageYesNoOpen(false)};   
    
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
        const filterData = data.filter((item => item.menuId === 'main'));
        setTimeout(()=>{
            setMenuInfo(filterData[0]);
            strOpenUrl("/main");
        },100)
    }

    // 로그아웃 버튼 클릭 시
    const LogOutClick = () => {
        let errMsg : any[] = [];
        errMsg.push({text: "로그아웃 하시겠습니까?"});
        message = errMsg;
        title   = "로그아웃 확인";
        setMessageYesNoOpen(true);
    }

    // 로그아웃 예 클릭 시 
    const messageYes = () => {
        // 로그인 화면으로 이동
        navigate("/");
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
        
        const filterData = data.filter((item => item.menuId === formUrl));
        
        setTimeout(()=>{
            setMenuInfo(filterData[0]);
            strOpenUrl("/" + formUrl);
        },100)
    }
    
    return (
        <div>
            <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {messageYes} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>
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
                            <img className = {styles.ImageComponent} src={ImageSetting} alt={"Setting"}/>
                            <img className = {styles.ImageComponent} src={ImageLogout} alt={"Logout"} onClick={LogOutClick}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default Navbar;