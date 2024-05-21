import axios from "axios";

export const SP_Request = async (SpName : string, sendData : any) => {
    const apiUrl = "http://localhost:9090/spRequest";

    try {
        const response = await axios.post(apiUrl, [{SpName : SpName, sendData : sendData}]);
        return response.data;
    } catch (error) {
        return [{ errMsg: error.message }];
    }
};


