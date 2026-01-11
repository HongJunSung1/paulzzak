import '../../global.d.ts';
import React, {useState}  from 'react';
import styles from './p-esg-common-SideBarItem.module.css';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'
import {SideBarSub} from './p-esg-common-sideBarItem.styles.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';

type SideBarItemProps = {
  item: any;
  strOpenUrl: any;
};


const SideBarItem = ({ item, strOpenUrl}: SideBarItemProps) => {
  // 클릭 할 때마다 화살표 위아래 모양 바꾸기
  const [collapsed, setCollapsed] = useState(false);
  const icon = collapsed ? <HiChevronUp /> : <HiChevronDown />;
  const { setMenuInfo } = useMenuInfo();

  function toggleCollapse() {
    setCollapsed(prevValue => !prevValue);
  }

  const handleClick = () => {
    setMenuInfo(item);
    strOpenUrl(item.url);
  };


  if(item.childrens.length > 0){
    return (
      <div>
        <div className = {styles.menuName}
                    style={{ fontWeight: item.pmenuId==="ROOT"? "600": "100",
                              height: item.pmenuId==="ROOT"? "35px": "15px",
                              lineHeight: item.pmenuId==="ROOT"? "35px": "15px",
                              paddingLeft: "15px",
                              paddingRight: "15px",
                              marginBottom: "0px",
                              marginTop: "0px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              // backgroundColor: "rgb(239 238 230)",
                              // backgroundColor: "rgb(31, 60, 126)",
                              backgroundColor: "#87010C",
                              fontSize: "14px",
                              color: "white"
                          }}
                    onClick={toggleCollapse}      
                          >{item.menuName}
          <span style={{paddingTop: "2px"}}>{icon}</span>
        </div>
        <div style={{overflow:"hidden", marginBottom: collapsed ? "15px" : "0px"}}>
        <SideBarSub isopen={collapsed}>
          {item.childrens.map((child : any) => (
            <SideBarItem key={child.id} item={child} strOpenUrl={strOpenUrl}/>
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
                        paddingLeft: "15px",
                        cursor: "pointer",
                        color: "rgb(199, 192, 192)"
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