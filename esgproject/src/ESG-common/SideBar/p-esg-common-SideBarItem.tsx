import '../../global.d.ts';
import React, {useState}  from 'react';
import styles from './p-esg-common-SideBarItem.module.css';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'
import {SideBarSub} from './p-esg-common-sideBarItem.styles.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
import MessageBoxYesNo from '../../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';

let message    : any     = [];
let title      : string  = "";

const SideBarItem = ({ item, strOpenUrl, isDataChanged, setIsDataChanged }) => {
  // 클릭 할 때마다 화살표 위아래 모양 바꾸기
  const [collapsed, setCollapsed] = useState(false);
  const icon = collapsed ? <HiChevronUp /> : <HiChevronDown />;
  const { setMenuInfo } = useMenuInfo();
  
  // YesNo메세지박스
  const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
  const messageYesNoClose = () => {setMessageYesNoOpen(false)};  



  function toggleCollapse() {
    setCollapsed(prevValue => !prevValue);
  }

  const handleClick = () => {
    setMenuInfo(item);
    strOpenUrl(item.url);
  };

  const handleClickMsg = () => {
    if(isDataChanged === true){
      setMessageYesNoOpen(true);
      let errMsg : any[] = [];
      errMsg.push({text: "화면 이동 시 저장되지 않은 데이터는 사라집니다. 이동하시겠습니까?"})
      title   = "※ 경고";
      message = errMsg;
    } else{
      handleClick();
    }
  }

  // 화면이동 '예' 클릭 시
  const messageYes = () => {
    handleClick();
    setMessageYesNoOpen(false);
    setIsDataChanged(false);
  }

  if(item.childrens.length > 0){
    return (
      <div>
        <div className = {styles.menuName}
                    style={{ fontWeight: item.pmenuId==="ROOT"? "bold": "100",
                              height: item.pmenuId==="ROOT"? "35px": "15px",
                              lineHeight: item.pmenuId==="ROOT"? "35px": "15px",
                              paddingLeft: "10px",
                              paddingRight: "10px",
                              marginBottom: "-5px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between"
                          }}
                    onClick={toggleCollapse}      
                          >{item.menuName}
          <span style={{paddingTop: "2px"}}>{icon}</span>
        </div>
        <div style={{overflow:"hidden"}}>
        <SideBarSub isopen={collapsed}>
          {item.childrens.map((child) => (
            <SideBarItem key={child.id} item={child} strOpenUrl={strOpenUrl} isDataChanged={isDataChanged} setIsDataChanged={setIsDataChanged} />
          ))}
        </SideBarSub>
        </div>
      </div>
    )
  } else{
    return (
      <div>
        <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {messageYes} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>            
        {/* <Link to = {item.url !== "" ? item.url : "main"} className = {styles.linkMenu}> */}
          <div className = {styles.menuName}
              style={{ fontWeight: item.pmenuId==="ROOT"? "bold": "100",
                        marginTop: item.pmenuId==="ROOT"? "15px": "5px",
                        paddingLeft: "10px",
                        cursor: "pointer",
                    }}
                    
              // onClick={handleClick}>{item.menuName}
              onClick={handleClickMsg}>{item.menuName}
          </div>  
        {/* </Link> */}
      </div>
    )
  }
}

export default SideBarItem