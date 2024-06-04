import React,{ useState, useEffect, useRef} from 'react'
import SideBarItem from './p-esg-common-SideBarItem.tsx';
import TopMenu from './p-esg-common-TopMenu.tsx';

import {SbContainer} from './p-esg-common-sideBarItem.styles.tsx';
import styles from './p-esg-common-SideBarItem.module.css';
import cookie from 'react-cookies';

const SideBar = ({ items }) => {

  const [menuData, setMenuData] = useState([]);
  const TotMenuData = cookie.load('menuList');
  const [isOpen,setIsOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("Environment");
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (TotMenuData && selectedMenu) {
      const filteredData = TotMenuData.filter(item => item.LMenuName === selectedMenu);
      setMenuData(filteredData);
    }
  }, [selectedMenu,TotMenuData]);

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


  if(menuData !== undefined){
    const nest = (menuData, menuId = "ROOT", link = 'pmenuId') =>
      menuData.filter(item => item[link] === menuId)
        .map(item => ({ ...item, childrens: nest(menuData, item.menuId) }));
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
        <div className = {styles.SideBarName} onClick={TopMenuOpen}>{selectedMenu}</div>
        {tree.map((subItem, index) =>
          <SideBarItem item={subItem} key={index}/>
        )}
      </SbContainer>
    )
  }
}

export default SideBar