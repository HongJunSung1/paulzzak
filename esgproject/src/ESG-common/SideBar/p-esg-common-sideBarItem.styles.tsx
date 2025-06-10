import styled from "styled-components";
import { Link } from 'react-router-dom';
import isPropValid from '@emotion/is-prop-valid';

// 사이드바 전체를 감싸는 div
export const SbContainer = styled.div`
  min-width: 16rem;
  width: 256px;
  min-height: 70vh;
  font-size: 14px;
  // background: #f8f7f3;
  background: rgb(31, 60, 126);

  @media (max-width: 768px) {
    width: 50px;
    min-width: 10rem;
    font-size: 12px;
  }

`

interface IisOpen{
  isopen : boolean;
};

// SbItem에서 하위메뉴들을 묶어줄 div
export const SideBarSub = styled('div').withConfig({
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'isopen'
})<IisOpen>`
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


// 제일 하위메뉴에서 클릭할 Link 
export const SideBarLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
`;