import React,{useEffect, useRef, useState} from 'react'
import styles from './p-esg-common-NavBar.module.css'
import '../../global.d.ts';
import SHA256 from 'crypto-js/sha256';

import ImageLogo from '../../assets/image/logo.png';
import ImageSetting from '../../assets/image/setting.png';
import ImageLogout from '../../assets/image/logout-black.png';
import ImageUserInfo from '../../assets/image/navbar-userinfo-white.png';
import ImagePassword from '../../assets/image/navbar-password-white.png';
import ImageXButton from '../../assets/image/condition/xButton-white.svg';
import ImageCheckButton from '../../assets/image/condition/check.svg';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'

import MessageBoxYesNo from '../../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';

import { useNavigate  } from 'react-router-dom';
import { SP_Request } from '../../hooks/sp-request.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
import cookie from 'react-cookies';

// 메시지 박스
let message : any     = [];
let title   : string  = "";
let messageType : string = ""; // 한 화면에서 YesNo 메세지박스를 2개로 쓰기 때문에 나눠주기 위한 플래그

// 화면 이동 URL
let displayUrl : string = "";

interface MenuInfo {
    id: string;
    menuName: string;
    url: string;
  }
  
  interface MenuInfoContextProps {
    menuInfo: MenuInfo | null;
  }
  
// const data = cookie.load('menuList') || [];
const sessionStr = sessionStorage.getItem('menuList');
let data : any;
if(sessionStr) {
    data = JSON.parse(sessionStr);
}


const Navbar = ({strOpenUrl, isDataChanged}) => {
    const { menuInfo } = useMenuInfo() as MenuInfoContextProps;

    // 로딩뷰
    const [loading,setLoading] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // YesNo메세지박스
    const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
    const messageYesNoClose = () => {setMessageYesNoOpen(false)};   
    
    const navigate = useNavigate()
    const [searchText,setSearchText] = useState('');
    const [resultData,setResultData] = useState<any>();
    const [isOpen,setIsOpen] = useState(false);
    const searchRef = useRef<any>(null);
    const { setMenuInfo } = useMenuInfo();
    const [settingCollapsed, setCollapsed] = useState(false);
    const [userInfoCollapsed, setUserInfoCollapsed] = useState(false);
    const [passwordCollapsed, setPasswordCollapsed] = useState(false);
    const settingRef = useRef<HTMLDivElement>(null);
    const userInfoArrow = userInfoCollapsed ? <HiChevronUp /> : <HiChevronDown />;
    const passwordArrow = passwordCollapsed ? <HiChevronUp /> : <HiChevronDown />;
    
    // ID 정보
    // const sessionStr = sessionStorage.getItem('userInfo');
    // let userInfo : any;
    // if(sessionStr){
    //     userInfo = JSON.parse(sessionStr);
    // }

    let UserID = cookie.load('userInfo')?.UserID;
    let UserEmail = cookie.load('userInfo')?.Email;
    let UserTelNo = "";

    // 전화번호(정규식 사용)
    if(cookie.load('userInfo')?.length === 11){
        UserTelNo = cookie.load('userInfo')?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    } else if(cookie.load('userInfo')?.length === 13){
        UserTelNo = cookie.load('userInfo')?.replace(/-/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    // 유저정보 변경 시 사용할 input
    const [userPassword    , setUserPassword]    = useState('')
    const [userPhoneNumber , setUserPhoneNumber] = useState('')
    const [userEmail       , setUserEmail]       = useState('')

    // 비밀번호 변경 시 사용할 input
    const [currentPassword , setCurrentPassword]  = useState('')
    const [newPassword     , setNewPassword]      = useState('')
    const [newPasswordCheck, setNewPasswordCheck] = useState('')


    useEffect(() => {
        const isLogin = cookie.load('userInfo') !== null;
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
        messageType = "isLogOut";
        let errMsg : any[] = [];
        errMsg.push({text: "로그아웃 하시겠습니까?"});
        message = errMsg;
        title   = "로그아웃 확인";
        setMessageYesNoOpen(true);
    }

    // 로그아웃 예 클릭 시 
    const messageYes = () => {
        if(messageType === "isLogOut"){
            // 로그인 화면으로 이동
            navigate("/");
        } else if(messageType === "moveUrl"){
            clickSearch(displayUrl);
            setMessageYesNoOpen(false);
        }
    }

    // 설정 클릭 시
    const isSetting = () => {
        //세팅 화면 클릭
        setCollapsed(prevValue => !prevValue);
        setUserInfoCollapsed(false);
        setPasswordCollapsed(false);
        setUserPassword('');
        setUserPhoneNumber('');
        setUserEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordCheck('');
    }

    // 설정: 개인정보 관리 클릭 시
    const isUserInfo = () => {
        //개인정보 관리 클릭
        setUserInfoCollapsed(prevValue => !prevValue);
    }

    // 설정: 비밀번호 관리 클릭 시
    const isPassword = () => {
        //비밀번호 관리 클릭
        setPasswordCollapsed(prevValue => !prevValue);
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

    
    const handleSearch = (formUrl) => {
        displayUrl = formUrl;
        clickSearch(formUrl);
    }

    const clickSearch = (formUrl) => {

        setSearchText('');
        setIsOpen(false);
        
        const filterData = data.filter((item => item.menuId === formUrl));
        
        setTimeout(()=>{
            setMenuInfo(filterData[0]);
            strOpenUrl("/" + formUrl);
        },100)
    }

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
          if (settingRef.current && !settingRef.current.contains(event.target as Node)) {
            setCollapsed(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [settingRef]);


    // 유저 정보 변경
    const userInfoChange = async () => {
        let errMsg : any[] = [];
        const regex = /^[0-9]*$/;

        if(!regex.test(userPhoneNumber)){
            errMsg.push({text: "전화번호는 숫자만 입력해주세요."});
            setMessageOpen(true);
            message = errMsg;
            title   = "저장 오류";
            return;
        }

        if(userPhoneNumber.length !== 11 ){
            errMsg.push({text: "전화번호는 11자리만 입력 가능합니다."});
            setMessageOpen(true);
            message = errMsg;
            title   = "저장 오류";
            return;
        }

        const currentPW = SHA256(userPassword).toString();

        setLoading(true);
        try {
            const result = await SP_Request("S_ESG_UserInfo_Reg", [{DataSet : 'DataSet1', UserID: UserID, PassWord: currentPW, ChgEmail: userEmail, ChgTelNo: userPhoneNumber}]);
            
            if(result){
                let errMsg : any[] = [];
                if(result[0][0].Status === "0"){
                    // SP 호출 결과 값 처리
                    errMsg.push({text: "저장 완료되었습니다. 변경된 정보 확인을 위해 재로그인 해주세요."});
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "저장 완료";
                } else{
                    errMsg.push({text: result[0][0].Message});
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "저장 오류";
                }
            } else{
                // SP 호출 결과 없을 경우 처리 로직
                let errMsg : any[] = [];
                errMsg.push({text: "저장 중 오류가 발생했습니다. 다시 시도해주세요."});
                setMessageOpen(true);
                message = errMsg;
                title   = "저장 에러";
            }
        } catch (error) {
            // SP 호출 시 에러 처리
            console.log(error);
        }
        setLoading(false);
    }

    // 유저 정보 변경 취소
    const userInfoCancel = () => {
        setUserPassword('');
        setUserPhoneNumber('');
        setUserEmail('');
        setUserInfoCollapsed(false);
    }
    
    // 유저 정보 : 현재 비밀번호
    const userPasswordChange = (e) => {
        setUserPassword(e.target.value);
    }

    // 유저 정보 : 핸드폰 번호
    const userPhoneNumberChange = (e) => {
        setUserPhoneNumber(e.target.value);
    }

    // 유저 정보 : 이메일
    const userEmailChange = (e) => {
        setUserEmail(e.target.value);
    }

    // 비밀번호 변경
    const passwordChange = async () => {
        const currentPW = SHA256(currentPassword).toString();
        const newPW = SHA256(newPassword).toString();
        const newPWCheck = SHA256(newPasswordCheck).toString();

        setLoading(true);
        try {
            const result = await SP_Request("S_ESG_Password_Change_Reg", [{DataSet : 'DataSet1', UserID: UserID, PassWord: currentPW, ChgPassWord: newPW, ChgPassWordCheck: newPWCheck}]);
            
            if(result){
                let errMsg : any[] = [];
                if(result[0][0].Status === "0"){
                    // SP 호출 결과 값 처리
                    errMsg.push({text: "비밀번호 변경이 완료되었습니다. 변경된 정보 확인을 위해 재로그인 해주세요."});
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "비밀번호 변경 완료";
                } else{
                    errMsg.push({text: result[0][0].Message});
                    setMessageOpen(true);
                    message = errMsg;
                    title   = "저장 오류";
                }
            } else{
                // SP 호출 결과 없을 경우 처리 로직
                let errMsg : any[] = [];
                errMsg.push({text: "비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요."});
                setMessageOpen(true);
                message = errMsg;
                title   = "저장 에러";
            }
        } catch (error) {
            // SP 호출 시 에러 처리
            console.log(error);
        }
        setLoading(false);        
    }

    // 비밀번호 변경 취소
    const passwordCancel = () => {
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordCheck('');
        setPasswordCollapsed(false);
    }

    // 비밀번호 관리 : 현재 비밀번호
    const currentPasswordChange = (e) => {
        setCurrentPassword(e.target.value);
    }

    // 비밀번호 관리 : 새 비밀번호
    const newPasswordChange = (e) => {
        setNewPassword(e.target.value);
    }

    // 비밀번호 관리 : 새 비밀번호 확인
    const newPasswordChangeCheck = (e) => {
        setNewPasswordCheck(e.target.value);
    }
    
    return (
        <div>
            <Loading loading={loading}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>            
            <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {messageYes} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>
            <div className = {styles.NavBarContainer}>
                    <div className = {styles.NavBarLeft} onClick={goMain}>
                        <div className = {styles.ImageLogoWrap}>
                            <img className = {styles.ImageLogo} src={ImageLogo} alt={"Logo"}/>
                        </div>
                    </div>
                <div className = {styles.NavBarItem}>
                    <div className = {styles.search}>
                        <input type="text" className={styles.SearchInput} onChange={searchHandler} value={searchText}></input>
                        {isOpen && <div className = {styles.SearchWrap} ref={searchRef}>
                                {resultData.map((Item, index) => (
                                    // <div className={styles.SearchItem} key={index} onClick={() => clickSearch(Item.FormUrl)}>{Item.FormName}</div>
                                    <div className={styles.SearchItem} key={index} onClick={() => handleSearch(Item.FormUrl)}>{Item.FormName}</div>
                                ))}
                        </div>}
                    </div>
                    <div className = {styles.ImageContainer}>
                        <div className = {styles.ImageWrap}>
                            <img className = {styles.ImageComponent} src={ImageSetting} alt={"Setting"} onClick={isSetting}/>
                            <img className = {styles.ImageComponent} src={ImageLogout} alt={"Logout"} onClick={LogOutClick}/>
                        </div>
                        {settingCollapsed && 
                        <div className = {styles.settingWrap} ref={settingRef}>
                            <div className = {styles.settingTitle}>
                                <div className = {styles.ID}>{UserID}</div>
                                <div className = {styles.TelNo}>{UserTelNo}</div>
                                <div className = {styles.Email}>{UserEmail}</div>
                            </div>
                            <div className = {styles.settingContents}>
                                <div className={styles.userInfoManageWrap}>
                                    <div className = {styles.userInfoManage} onClick={isUserInfo}>
                                        <div className={styles.contentsLeft}>
                                            <img src={ImageUserInfo} alt={"UserInfo"} className={styles.ImageUserInfo}/>
                                            <div className = {styles.userInfoText}>개인정보 관리</div>
                                        </div>
                                        <div style={{color: "white"}}>{userInfoArrow}</div>
                                    </div>
                                    {userInfoCollapsed &&
                                    <div className = {styles.userInfoContents}>
                                        <div className={styles.inputHeight} style={{marginTop: "10px"}}>
                                            <input type="password" placeholder="현재 비밀번호" className={styles.InputContents} onChange={userPasswordChange} value={userPassword}/>
                                        </div>
                                        <div className={styles.inputHeight}>
                                            <input type="text" placeholder="핸드폰 번호" className={styles.InputContents} onChange={userPhoneNumberChange} value={userPhoneNumber}/>
                                        </div> 
                                        <div className={styles.inputHeight}>
                                            <input type="text" placeholder="이메일" className={styles.InputContents} onChange={userEmailChange} value={userEmail}/>
                                        </div>    
                                        <div className={styles.inputCheck}>
                                            <div className={styles.OkWrap} onClick={userInfoChange}>
                                                <div className={styles.inputOk}>확인</div>
                                                <img src={ImageCheckButton} alt="CheckButton" className={styles.CheckButton}/>
                                            </div>
                                            <div className={styles.OkWrap} onClick={userInfoCancel}>
                                                <div className={styles.inputCancel}>취소</div>
                                                <img src={ImageXButton} alt="xButton" className={styles.CheckButton}/>
                                            </div>
                                        </div>                                       
                                    </div>}
                                </div>
                                <div className={styles.passwordManageWrap}>
                                    <div className = {styles.passwordManage} onClick={isPassword}>
                                        <div className={styles.contentsLeft}>
                                            <img src={ImagePassword} alt={"Password"} className={styles.ImagePassword}/>
                                            <div className = {styles.passwordText}>비밀번호 관리</div>
                                        </div>
                                        <div style={{color: "white"}}>{passwordArrow}</div>
                                    </div>
                                    {passwordCollapsed && 
                                    <div className = {styles.passwordContents}>
                                        <div className={styles.inputHeight} style={{marginTop: "10px"}}>
                                            <input type="password" placeholder="현재 비밀번호" className={styles.InputContents} onChange={currentPasswordChange} value={currentPassword}/>
                                        </div>
                                        <div className={styles.inputHeight}>
                                            <input type="password" placeholder="신규 비밀번호" className={styles.InputContents} onChange={newPasswordChange} value={newPassword}/>
                                        </div> 
                                        <div className={styles.inputHeight}>
                                            <input type="password" placeholder="신규비밀번호 확인" className={styles.InputContents} onChange={newPasswordChangeCheck} value={newPasswordCheck}/>
                                        </div>    
                                        <div className={styles.inputCheck}>
                                            <div className={styles.OkWrap} onClick={passwordChange}>
                                                <div className={styles.inputOk}>확인</div>
                                                <img src={ImageCheckButton} alt="CheckButton" className={styles.CheckButton}/>
                                            </div>
                                            <div className={styles.OkWrap} onClick={passwordCancel}>
                                                <div className={styles.inputCancel}>취소</div>
                                                <img src={ImageXButton} alt="xButton" className={styles.CheckButton}/>
                                            </div>
                                        </div>   
                                    </div>
                                    }
                                </div>    
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default Navbar;