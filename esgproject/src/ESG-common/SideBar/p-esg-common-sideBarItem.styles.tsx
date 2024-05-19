import styled from "styled-components";
import { Link } from 'react-router-dom';
import { Interface } from "readline";


// 사이드바 전체를 감싸는 div
export const SbContainer = styled.div`
  min-width: 16rem;
  width: 256px;
  min-height: 70vh;
  font-size: 14px;
  background: #f8f7f3;
`

interface IisOpen{
  isopen : Boolean;
};

// SbItem에서 하위메뉴들을 묶어줄 div
export const SideBarSub = styled.div<IisOpen>`
  overflow: hidden;
  max-height:0;
  ${props => props.isopen ? "animation: slide-fade-in-dropdown-animation 0.1s ease; max-height: 100%;" : "animation: slide-fade-out-dropdown-animation 0.1s ease; max-height: 0;"};

  @keyframes slide-fade-in-dropdown-animation {
    0% {
      transform: translateY(-100%);
    }
  
    100% {
      transform: translateY(0);
    }
  }

  @keyframes slide-fade-out-dropdown-animation {
    0% {
      transform: translateY(0);
    }
  
    100% {
      transform: translateY(-100%);
    }
  }
`


