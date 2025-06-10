import styled from "styled-components";

export const Container = styled.div`
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: row;
`

export const DataContainer = styled.div`
    width: 100vw;
    height: calc(100vh - 68px);
    width : calc(100vw - 276px);
    display: flex;
    margin: 10px 10px;
    flex-direction: column;

  @media (max-width: 768px) {
    width : calc(100vw - 120px);
  }
`

export const DataContainerLogin = styled.div`
    width: 100vw;
    height: calc(100vh - 68px);
    display: flex;
    flex-direction: column;
`
