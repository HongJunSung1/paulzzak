import React from "react";
import { SyncLoader
} from "react-spinners";
import styled from "styled-components";

    const Loading = ({ loading }) => {
        if(loading == true){
            return (
                <SpinnerWrap>
                    <LoaderWrap>
                        <SyncLoader
                            color="black"
                            loading={loading}
                            size={30}
                            speedMultiplier={0.7}
                        />
                    </LoaderWrap>
                </SpinnerWrap>
            );
        }
    };

    const SpinnerWrap = styled.div`
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 50;
        position: fixed;
        background-color: grey;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.3;
    `

    const LoaderWrap = styled.div`
        opacity: 1;
        z-index:100;
    `
  
    export default Loading;