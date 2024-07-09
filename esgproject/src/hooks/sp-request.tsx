import axios from "axios";

export const SP_Request = async (SpName : string, sendData : any) => {
    // const apiUrl = "http://localhost:9090/spRequest";
    const apiUrl = "http://43.203.127.56:9090/ESGbbollock/spRequest";

    const userInfoStr = sessionStorage.getItem('userInfo');
    let userInfo : any;
    if(userInfoStr){
        userInfo = JSON.parse(userInfoStr);
    }
    
    const userCD = userInfo?.UserCD;


    try {
        const response = await axios.post(apiUrl, [{SpName : SpName, sendData : sendData, userInfo : { UserCD : userCD}}]);
        return response.data;
    } catch (error) {
        return [{ errMsg: error.message }];
    }
};


