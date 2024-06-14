    import React, {useState, useEffect} from 'react'
    import '../../global.d.ts';
    import styles from './p-esg-common-Tab.module.css';
    import { useMenuInfo } from '../../hooks/use-menu-info.tsx';
    import cookie from 'react-cookies';

    import MessageBoxYesNo from '../../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';

    // import { useNavigate } from 'react-router-dom';

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

    
    const data = cookie.load('menuList') || [];

    let message    : any     = [];
    let title      : string  = "";

    const Tab = ({strOpenUrl ,openTabs, isDataChanged, setIsDataChanged}) => {
        const { menuInfo } = useMenuInfo() as MenuInfoContextProps;
        const { setMenuInfo } = useMenuInfo();
        const [activeTab, setActiveTab] = useState<string | null>(initialMenuInfo.id);
        const [tabData, setTabData] = useState<MenuInfo[]>([initialMenuInfo]);
        const [menuChange, setMenuChange] = useState<any>([]);
        // const navigate = useNavigate();
        
        // YesNo메세지박스
        const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
        const messageYesNoClose = () => {setMessageYesNoOpen(false)};  


        useEffect(()=>{
            openTabs(tabData);
        },[tabData, openTabs])

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
                // navigate(initialMenuInfo.url);
                strOpenUrl(initialMenuInfo.url);
            }
        }, [menuInfo, strOpenUrl]);
        
        const handleTabClick = (tab: MenuInfo) => {
            setActiveTab(tab.id);
            // navigate(tab.url); // URL을 변경하여 해당 경로로 이동합니다.

            const filterData = data.filter((item => item.menuId === tab.url));
            setMenuInfo(filterData[0]);
            strOpenUrl(tab.url);
        };

        const handleTabClickMsg = (tab: MenuInfo) => {
            if(isDataChanged === true){
                setMessageYesNoOpen(true);
                let errMsg : any[] = [];
                errMsg.push({text: "화면 이동 시 저장되지 않은 데이터는 사라집니다. 이동하시겠습니까?"})
                title   = "※ 경고";
                message = errMsg;
                setMenuChange({id: tab.id, menuName: tab.menuName, url: tab.url});
            } else{
                handleTabClick(tab);
            }
        }

        const messageYes = () => {
            handleTabClick(menuChange);
            setMessageYesNoOpen(false);
            setIsDataChanged(false);
        }


        const closeTab = (tab) => {
            if (tab.id !== "4"){
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
                <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {messageYes} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>            
                <div className={styles.TabContainer}>
                    <div className={styles.TabWrap}>
                        {tabData.map((tab)=> (
                            <div className={styles.Tab} 
                                key={tab.id} 
                                data-active={activeTab===tab.id ? "true" : "false"} 
                                // onClick={() => handleTabClick(tab)}
                                onClick={() => handleTabClickMsg(tab)}
                                style={{backgroundColor: activeTab===tab.id ? "white" : "rgb(233, 235, 235)",
                                        borderTop: activeTab===tab.id ? "solid 3px black" : "solid 3px gray",
                                        borderBottom: activeTab===tab.id ? "none" : "solid 0.5px rgb(200, 200, 200)"
                                }}>
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