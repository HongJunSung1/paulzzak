import React from 'react'
import cookie from 'react-cookies';
import styled from 'styled-components';

const TopMenu = ({isOpen, selectMenu}) => {

    const LMenuList = cookie.load('LmenuList');

    const LMenuClick = (item) => {
        selectMenu(item.LMenuName);
    }

    if(LMenuList !== undefined){
        if(isOpen){
            return (
                <TopMenuWrap>
                    <div style={{width:"100%", 
                                height:"44px", 
                                textAlign:"center",
                                fontSize:"25px",
                                fontWeight:"bold",
                                lineHeight:"44px",
                                backgroundColor:"#d34e4e",
                                color:"white"}}>모듈 선택</div>
                    {LMenuList.map((item, key)=><TopMenuItems key={key}  onClick={() => LMenuClick(item)}>{item.LMenuName}</TopMenuItems>)}
                </TopMenuWrap>
            )
        }
    }

    return null;
}


const TopMenuWrap = styled.div`
    top: 48px;
    left: 256px;
    width: 250px;
    height: auto;
    z-index: 50;
    position: fixed;
    background-color: rgb(255, 245, 245);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction : column;
    border-radius: 0px 0px 20px 20px / 0px 0px 20px 20px;
    border-style : solid;
    border-width : 0.25px;
    border-color : rgb(100, 100, 100, 0.4)
`

const TopMenuItems = styled.div`
    padding: 10px 40px;
    margin : 10px;
    font-weight: bold;
    font-size: 20px;
    cursor: pointer;
    border-radius: 10px;
    &:hover {
        background: rgb(196, 133, 133);
        color: white;
        transition: 0.5s;
        
    }
    
`



export default TopMenu