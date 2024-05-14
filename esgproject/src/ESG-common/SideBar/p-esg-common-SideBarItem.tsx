import React, {useState}  from 'react';
import styles from './p-esg-common-SideBarItem.module.css';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'
import {SideBarSub} from './p-esg-common-sideBarItem.styles';

const SideBarItem = ({ item }) => {
  // 클릭 할 때마다 화살표 위아래 모양 바꾸기
  const [collapsed, setCollapsed] = useState(false);
  const icon = collapsed ? <HiChevronUp /> : <HiChevronDown />;

  function toggleCollapse() {
    setCollapsed(prevValue => !prevValue);
  }


  if(item.childrens.length > 0){
    return (
      <div>
        <div className = {styles.menuName}
                    style={{ fontWeight: item.pmenuId==="ROOT"? "bold": "100",
                              marginTop: item.pmenuId==="ROOT"? "15px": "5px",
                              paddingLeft: "10px",
                              paddingRight: "10px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between"
                          }}
                    onClick={toggleCollapse}      
                          >{item.menuName}
          <span style={{paddingTop: "2px"}}>{icon}</span>
        </div>
        <SideBarSub isOpen={collapsed}>
          {item.childrens.map((child) => (
            <SideBarItem key={child.id} item={child} />
          ))}
        </SideBarSub>
      </div>
    )
  } else{
    return (
      <div>
        <div className = {styles.menuName}
             style={{ fontWeight: item.pmenuId==="ROOT"? "bold": "100",
                      marginTop: item.pmenuId==="ROOT"? "15px": "5px",
                      paddingLeft: "10px",
                      cursor: "pointer",
                   }}>{item.menuName}
        </div>  
      </div>
    )
  }
}

export default SideBarItem