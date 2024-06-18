import '../../global.d.ts';
import React, {useState, useEffect}  from 'react';
import styles from './p-esg-common-SideBarItem.module.css';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'
import {SideBarSub} from './p-esg-common-sideBarItem.styles.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';

let message    : any     = [];
let title      : string  = "";

interface MenuInfo {
  id: string;
  menuName: string;
  url: string;
}

interface MenuInfoContextProps {
  menuInfo: MenuInfo | null;
}

// 초기 페이지 데이터 설정(현재 main)
const initialMenuInfo: MenuInfo = {
    id: '4',
    menuName: 'main',
    url: '/main'
};

const SideBarItem = ({ item, strOpenUrl, isDataChanged}) => {
  // 클릭 할 때마다 화살표 위아래 모양 바꾸기
  const [collapsed, setCollapsed] = useState(false);
  const icon = collapsed ? <HiChevronUp /> : <HiChevronDown />;
  const { setMenuInfo } = useMenuInfo();
  const { menuInfo } = useMenuInfo() as MenuInfoContextProps;
  const [activeMenu, setActiveMenu] = useState<string | null>(initialMenuInfo.id);

  // YesNo메세지박스
  const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
  const messageYesNoClose = () => {setMessageYesNoOpen(false)};  

  function toggleCollapse() {
    setCollapsed(prevValue => !prevValue);
  }

  useEffect(() => {
    if (menuInfo && menuInfo.id && menuInfo.url !== "") {
      setActiveMenu(menuInfo.id);
    }
  }, [menuInfo, strOpenUrl])

  const handleClick = () => {
    setMenuInfo(item);
    strOpenUrl(item.url);
  };


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
            <SideBarItem key={child.id} item={child} strOpenUrl={strOpenUrl} isDataChanged={isDataChanged}/>
          ))}
        </SideBarSub>
        </div>
      </div>
    )
  } else{
    return (
      <div>
        {/* <Link to = {item.url !== "" ? item.url : "main"} className = {styles.linkMenu}> */}
          <div className = {styles.menuName}
              style={{ fontWeight: item.pmenuId==="ROOT"? "bold": "100",
                        marginTop: item.pmenuId==="ROOT"? "15px": "5px",
                        paddingLeft: "10px",
                        cursor: "pointer",
                    }}
                    
              // onClick={handleClick}>{item.menuName}
              onClick={handleClick}>{item.menuName}
          </div>  
        {/* </Link> */}
      </div>
    )
  }
}

export default SideBarItem