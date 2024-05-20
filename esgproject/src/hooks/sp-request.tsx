import axios from "axios";

export const SP_Request = (SpName,sendData) => {
    console.log(sendData[0].key);

    const apiUrl = "http://localhost:8080/spRequest";

    axios.post(apiUrl,[SpName, sendData])
    .then((result)=>{
        console.log(result.data);
        return result.data;
    })
    .catch((err)=>{
        console.log(err);
        return err;
    })
}



