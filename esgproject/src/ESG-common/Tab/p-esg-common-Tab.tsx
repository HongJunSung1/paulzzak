    import React, {useState, useEffect} from 'react'
    import '../../global.d.ts';
    import styles from './p-esg-common-Tab.module.css';
    import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
    // import cookie from 'react-cookies';

    // import { useNavigate } from 'react-router-dom';

    interface MenuInfo {
        id: string;
        menuName: string;
        url: string;
    }
    
    interface MenuInfoContextProps {
        menuInfo: MenuInfo | null;
    }



    // // 초기 페이지 데이터 설정(현재 main)
    // const initialMenuInfo: MenuInfo = {
    //     id: '4',
    //     menuName: 'main',
    //     url: '/main'
    // };

    // const sessionStr = sessionStorage.getItem('menuList')
    // let data : any;
    // if(sessionStr){
    //     data = JSON.parse(sessionStr);
    // }

    // const data = cookie.load('menuList') || [];
    // const currentDisplay : string = tabData;

    // const sessionStr2 = sessionStorage.getItem('menuList');
    // let initialMenuInfo : MenuInfo;
    // if(sessionStr2){
    //     initialMenuInfo = JSON.parse(sessionStr2).find(item => item.url === 'main')
    // }


    const Tab = ({strOpenUrl ,openTabs}) => {

        const [data,setData] = useState<any>(null);
        const [initialMenuInfo,setInitialMenuInfo] = useState<MenuInfo | null>(null);

        const { menuInfo } = useMenuInfo() as MenuInfoContextProps;
        
        const { setMenuInfo } = useMenuInfo();
        const [activeTab, setActiveTab] = useState<string | null>(null);
        const [tabData, setTabData] = useState<MenuInfo[]>([]);
        // const navigate = useNavigate();

        useEffect(() => {
            const sessionStr = sessionStorage.getItem('menuList');
            if (sessionStr) {
                const parsedData = JSON.parse(sessionStr);
                setData(parsedData);
                const mainMenu = parsedData.find((item: MenuInfo) => item.url === 'main');
                setInitialMenuInfo(mainMenu || null);
            }
        }, []);

        useEffect(()=>{
            if(initialMenuInfo){
                setActiveTab(initialMenuInfo.id);
                setTabData([initialMenuInfo])
            }
        },[initialMenuInfo,data])
        

        useEffect(()=>{
            openTabs(tabData);
        },[tabData, openTabs])

        // useEffect(() => {
        //     if (menuInfo && menuInfo.id && menuInfo.url !== "") {

        //         const newTab = {
        //             id: menuInfo.id,
        //             menuName: menuInfo.menuName,
        //             url: "/" + menuInfo.url
        //         };

        //         setTabData(prevTabData => {
        //             if (prevTabData.some(tab => tab.id === newTab.id)) {
        //             return prevTabData;
        //             } else {
        //             return [...prevTabData, newTab];
        //             }
        //         });
        //         setActiveTab(menuInfo.id);
        //         //   navigate(menuInfo.url);
            
        //     }

        //     // 새로고침 시 맨 처음 화면으로 이동시키기
        //     if(menuInfo === null && initialMenuInfo){
        //         setActiveTab(initialMenuInfo.id);
        //         // navigate(initialMenuInfo.url);
        //         strOpenUrl("/"+initialMenuInfo.url);
        //     }
        // }, [menuInfo, strOpenUrl, initialMenuInfo]);
        useEffect(() => {
            if (menuInfo && menuInfo.id && menuInfo.url !== "") {
              // 1. 타입 강제 변환 + 슬래시 제거 후 추가
              const newTab = {
                id: String(menuInfo.id), // 👈 항상 string으로 변환
                menuName: menuInfo.menuName,
                url: "/" + menuInfo.url.replace(/^\//, '') // 👈 중복 슬래시 방지
              };
          
              setTabData(prevTabData => {
                const isDuplicate = prevTabData.some(
                  tab => tab.id === newTab.id || tab.url === newTab.url
                );
          
                if (isDuplicate) return prevTabData;
                return [...prevTabData, newTab];
              });
          
              setActiveTab(String(menuInfo.id));
            }
          
            if (menuInfo === null && initialMenuInfo) {
              setActiveTab(initialMenuInfo.id);
              strOpenUrl("/" + initialMenuInfo.url);
            }
          }, [menuInfo, strOpenUrl, initialMenuInfo]);
          
        const handleTabClick = (tab: MenuInfo) => {
            setActiveTab(tab.id);
            // navigate(tab.url); // URL을 변경하여 해당 경로로 이동합니다.
            const filterData = data.filter((item => item.url === tab.url.replace('/', '')));
            setMenuInfo(filterData[0]);
            if(tab.url === "main"){
                strOpenUrl("/"+tab.url);
            }else{
                strOpenUrl(tab.url);
            }
        };



        const closeTab = (tab) => {
            if (tab.url !== "main"){
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
                                // navigate(newTabData[order].url); // URL을 변경하여 해당 경로로 이동합니다.
                                strOpenUrl(newTabData[order].url);
                            }else {
                                setActiveTab(newTabData[order-1].id);
                                // navigate(newTabData[order-1].url); // URL을 변경하여 해당 경로로 이동합니다.
                                strOpenUrl(newTabData[order-1].url);
                            }
                        } else{
                            originTabData = newTabData.filter((item) => item.id ===activeTab)
                            setActiveTab(activeTab);
                            // navigate(originTabData[0].url); // URL을 변경하여 해당 경로로 이동합니다.
                            strOpenUrl(originTabData[0].url);
                        }
                    }
                },100)
            }
        }

        return(
            <>        
                <div className={styles.TabContainer}>
                    <div className={styles.TabWrap}>
                        {tabData.map((tab)=> (
                            <div className={styles.Tab} 
                                key={tab.id} 
                                data-active={activeTab===tab.id ? "true" : "false"} 
                                // onClick={() => handleTabClick(tab)}
                                style={{backgroundColor: activeTab===tab.id ? "white" : "rgb(233, 235, 235)",
                                        borderTop: activeTab===tab.id ? "solid 3px black" : "solid 3px gray",
                                        borderBottom: activeTab===tab.id ? "none" : "solid 0.5px rgb(200, 200, 200)"
                                }}>
                                <div onClick={() => handleTabClick(tab)}>
                                    {tab.menuName}
                                </div>
                                {/* <button className={styles.BtnClose} onClick={() => closeTab(tab)}></button> */}
                                {tab.id === "11" ? <div style={{marginRight: "16px"}}></div> :
                                    <button className={styles.BtnClose} onClick={() => closeTab(tab)}></button>
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )
    }

    export default Tab