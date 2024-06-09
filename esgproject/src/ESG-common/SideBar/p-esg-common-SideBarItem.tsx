import '../../global.d.ts';
import React, {useState}  from 'react';
import styles from './p-esg-common-SideBarItem.module.css';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'
import {SideBarSub} from './p-esg-common-sideBarItem.styles.tsx';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';

const SideBarItem = ({ item, strOpenUrl }) => {
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
            <SideBarItem key={child.id} item={child} strOpenUrl={strOpenUrl} />
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
                    
              onClick={handleClick}>{item.menuName}
          </div>  
        {/* </Link> */}
      </div>
    )
  }
}

export default SideBarItem