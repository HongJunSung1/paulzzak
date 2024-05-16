import React from 'react'
import SideBarItem from './p-esg-common-SideBarItem.tsx';
import menuData from './testdata.json';
import {SbContainer} from './p-esg-common-sideBarItem.styles.tsx';

const SideBar = ({ items }) => {
  const nest = (menuData, menuId = "ROOT", link = 'pmenuId') =>
    menuData.filter(item => item[link] === menuId)
      .map(item => ({ ...item, childrens: nest(menuData, item.menuId) }));
  const tree = nest(menuData);
  
  return (
    <SbContainer>
      <h2>ESG</h2>
      {tree.map((subItem, index) =>
        <SideBarItem item={subItem} key={index} />
      )}
    </SbContainer>
  )
}

export default SideBar