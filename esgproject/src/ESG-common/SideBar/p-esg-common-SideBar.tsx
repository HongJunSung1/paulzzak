import React,{ useState, useEffect, useRef} from 'react'
import SideBarItem from './p-esg-common-SideBarItem.tsx';
import TopMenu from './p-esg-common-TopMenu.tsx';

import {SbContainer} from './p-esg-common-sideBarItem.styles.tsx';
import styles from './p-esg-common-SideBarItem.module.css';
// import cookie from 'react-cookies';

import SideBarImage from '../../assets/image/menu-bar.png';

type SideBarProps = {
  items: any;
  strOpenUrl: any;
};


const SideBar = ({items, strOpenUrl}: SideBarProps) => {

  const [menuData, setMenuData] = useState<any>([]);
  const [TotMenuData, setTotMenuData] = useState<any>([]);
  const [isOpen,setIsOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컴포넌트가 처음 마운트될 때 쿠키에서 데이터 로드
    // const data = cookie.load('menuList') || [];
    const sessionStr = sessionStorage.getItem('menuList');
    let data : any;
    if(sessionStr){
      data = JSON.parse(sessionStr);
    }
    
    if(data){
      setTotMenuData(data);
      setSelectedMenu(data.find((item : any) => item.id === '1').LMenuName);
    }
  }, []);

   useEffect(() => {
    if (selectedMenu) {
      const filteredData = TotMenuData.filter((item : any) => item.LMenuName === selectedMenu);
      setMenuData(filteredData);
    }
  }, [selectedMenu, TotMenuData]);


  useEffect(() => {
    const handleClickOutside = (event : MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleUrlChange = (url : any) => {
    strOpenUrl('/' + url);
  };


  if(menuData !== undefined){
    const nest = (menuData : any, menuId = "ROOT", link = 'pmenuId') =>
      menuData.filter((item : any) => item[link] === menuId)
        .map((item : any) => ({ ...item, childrens: nest(menuData, item.menuId)}));
    const tree = nest(menuData);

    const TopMenuOpen = async () => {
      if(isOpen === false){
        setIsOpen(true);
      }else{
        setIsOpen(false);
      }
    }
    
    return (
      <SbContainer>
        <div ref={menuRef}>
          <TopMenu isOpen={isOpen} selectMenu={setSelectedMenu}/>
        </div>
        <div className={styles.sideBarNameWrap} onClick={TopMenuOpen}>
          <div className = {styles.SideBarName}>{selectedMenu}</div>
          <img className={styles.sideBarImage} src={SideBarImage} alt={"sidebarImage"}></img>
        </div>
        {tree.map((subItem : any, index : any) =>
          <SideBarItem item={subItem} key={index} strOpenUrl={handleUrlChange}/>
        )}
      </SbContainer>
    )
  }
}

export default SideBar