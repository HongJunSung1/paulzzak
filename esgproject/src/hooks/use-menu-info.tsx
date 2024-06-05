// 사이드바에서 가져오는 화면 정보 저장
import React, { useState, createContext, useContext, ReactNode } from 'react';

interface MenuInfo {
  item: any; // item의 타입에 맞게 수정
}

interface MenuInfoContextProps {
    menuInfo: MenuInfo | null;
    setMenuInfo: (item: MenuInfo) => void;
}

const MenuInfoContext = createContext<MenuInfoContextProps | undefined>(undefined);

export const MenuInfoProvider = ({ children }: { children: ReactNode }) => {
  const [menuInfo, setMenuInfo] = useState<MenuInfo | null>(null);

  return (
    <MenuInfoContext.Provider value={{ menuInfo, setMenuInfo }}>
      {children}
    </MenuInfoContext.Provider>
  );
};

export const useMenuInfo = () => {
  const context = useContext(MenuInfoContext);
  if (!context) {
    throw new Error('useMenuInfo must be used within a MenuInfoProvider');
  }
  return context;
};