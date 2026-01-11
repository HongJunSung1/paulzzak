import React, { useEffect, useState } from 'react'
// import cookie from 'react-cookies';
import styled from 'styled-components';

type TopMenuProps = {
  isOpen: any;
  selectMenu: any;
};

const TopMenu = ({isOpen, selectMenu}: TopMenuProps) => {

    // const LMenuList = cookie.load('LmenuList');
    const sessionStr = sessionStorage.getItem('LmenuList');
    let LMenuList : any;
    if(sessionStr){
        LMenuList = JSON.parse(sessionStr);
    }


    const [isOpen2,setIsOpen2] = useState(isOpen);

    useEffect(()=>{
        setIsOpen2(isOpen);
    }, [isOpen])

    const LMenuClick = (item: any) => {
        setIsOpen2(false);
        selectMenu(item.LMenuName);
    }

    if(LMenuList !== undefined){
        if(isOpen2){
            return (
                <TopMenuWrap>
                    <div style={{width:"100%", 
                                height:"44px", 
                                padding: "0px 10px",
                                fontSize:"20px",
                                fontWeight:"bold",
                                lineHeight:"44px",
                                // backgroundColor:"#d34e4e",
                                // backgroundColor: "rgb(31, 60, 126)",
                                backgroundColor: "#87010C",
                                color:"white"}}>모듈 선택</div>
                    {LMenuList.map((item : any, key : any)=><TopMenuItems key={key}  onClick={() => LMenuClick(item)}>{item.LMenuName}</TopMenuItems>)}
                </TopMenuWrap>
            )
        }
    }

    return null;
}


const TopMenuWrap = styled.div`
    top: 48px;
    left: 256px;
    width: 200px;
    height: auto;
    z-index: 999;
    position: fixed;
    background-color: rgb(255, 245, 245);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction : column;
    border-radius: 0px 0px 20px 20px / 0px 0px 20px 20px;
    border-style : solid;
    border-width : 0.25px;
    border-color : rgb(100, 100, 100, 0.4);
    overflow: hidden;
`

const TopMenuItems = styled.div`
    width: 100%;
    padding: 10px 10px;
    margin : 10px 0px;
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
    &:hover {
        // background: rgb(196, 133, 133);
        // background: rgb(75, 110, 228);
        background: #87010C;
        color: white;
        transition: 0.5s;
        
    }
    
`



export default TopMenu