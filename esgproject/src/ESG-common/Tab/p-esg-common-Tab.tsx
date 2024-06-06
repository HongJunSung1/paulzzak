import React, {useState, useEffect} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-Tab.module.css';
import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
import { useNavigate } from 'react-router-dom';

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


const Tab = () => {
    const { menuInfo } = useMenuInfo() as MenuInfoContextProps;
    const [activeTab, setActiveTab] = useState<string | null>(initialMenuInfo.id);
    const [tabData, setTabData] = useState<MenuInfo[]>([initialMenuInfo]);
    const navigate = useNavigate();

    useEffect(() => {
        if (menuInfo && menuInfo.id && menuInfo.url !== "") {
          const newTab = {
            id: menuInfo.id,
            menuName: menuInfo.menuName,
            url: "/" + menuInfo.url
          };
    
          setTabData(prevTabData => {
            if (prevTabData.some(tab => tab.id === newTab.id)) {
              return prevTabData;
            } else {
              return [...prevTabData, newTab];
            }
          });
    
          setActiveTab(menuInfo.id);
        //   navigate(menuInfo.url);
          
        }

        // 새로고침 시 맨 처음 화면으로 이동시키기
        if(menuInfo === null){
            setActiveTab(initialMenuInfo.id);
            navigate(initialMenuInfo.url);
        }
    }, [menuInfo]);
    
    const handleTabClick = (tab: MenuInfo) => {
        setActiveTab(tab.id);
        navigate(tab.url); // URL을 변경하여 해당 경로로 이동합니다.
    };


    const closeTab = (tab) => {
        let order : number = 0;
        let newTabData : any[] = [];
        let originTabData : any[] = [];

        order = tabData.findIndex(i => i.id === tab.id);

        setTimeout(()=>{
            newTabData = tabData.filter((item) => item.id !==tab.id)
            
            if(newTabData.length > 0){
                setTabData(newTabData)
                if(activeTab === tab.id){
                    if(newTabData.length > order){
                        setActiveTab(newTabData[order].id);
                        navigate(newTabData[order].url); // URL을 변경하여 해당 경로로 이동합니다.
                    }else {
                        setActiveTab(newTabData[order-1].id);
                        navigate(newTabData[order-1].url); // URL을 변경하여 해당 경로로 이동합니다.
                    }
                } else{
                    originTabData = newTabData.filter((item) => item.id ===activeTab)
                    setActiveTab(activeTab);
                    navigate(originTabData[0].url); // URL을 변경하여 해당 경로로 이동합니다.
                }
            }
        },100)
    }

    return(
        <>
            <div className={styles.TabContainer}>
                <div className={styles.TabWrap}>
                    {tabData.map((tab)=> (
                        <div className={styles.Tab} 
                             key={tab.id} 
                             data-active={activeTab===tab.id ? "true" : "false"} 
                             onClick={() => handleTabClick(tab)}
                             style={{backgroundColor: activeTab===tab.id ? "white" : "rgb(233, 235, 235)"}}>
                            {tab.menuName}
                            <button className={styles.BtnClose} onClick={() => closeTab(tab)}></button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Tab