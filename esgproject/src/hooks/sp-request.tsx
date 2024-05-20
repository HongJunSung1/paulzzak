import axios from "axios";

export const SP_Request = async (SpName : string, sendData : any) => {
    const apiUrl = "http://localhost:8000/spRequest";

    try {
        const response = await axios.post(apiUrl, [SpName, sendData]);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log("test");
        return [{ errMsg: error.message }];
    }
};


