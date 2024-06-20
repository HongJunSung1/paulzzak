import axios from "axios";
import cookie from 'react-cookies';

export const SP_Request = async (SpName : string, sendData : any) => {
    const apiUrl = "http://localhost:9090/spRequest";
    
    
    const userCD = cookie.load('userInfo') ? cookie.load('userInfo').UserCD : "";


    try {
        const response = await axios.post(apiUrl, [{SpName : SpName, sendData : sendData, userInfo : { UserCD : userCD}}]);
        return response.data;
    } catch (error) {
        return [{ errMsg: error.message }];
    }
};


