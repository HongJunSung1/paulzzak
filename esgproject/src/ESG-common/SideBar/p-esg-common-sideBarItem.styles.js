import styled from "styled-components";
import { Link } from 'react-router-dom';


// 사이드바 전체를 감싸는 div
export const SbContainer = styled.div`
  min-width: 16rem;
  width: auto;
  height: 100%;
  min-height: 70vh;
  font-size: 14px;
  position: absolute;
  background: #f8f7f3;
`

// SbItem에서 하위메뉴들을 묶어줄 div
export const SideBarSub = styled.div`
  overflow: hidden;
  max-height: ${props => props.isOpen ? "100%" : "0"};
`
