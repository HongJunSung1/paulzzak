import axios from "axios";

export const SP_Request = async (SpName : string, sendData : any, strUrl? : any) => {
    // 로컬로 돌릴 때(자바 켜있는지 확인)
    // const apiUrl = "http://localhost:9090/spRequest";

    // 서버로 돌릴 때
    // const apiUrl = "http://43.203.127.56:9090/ESGbbollock/spRequest";

    // 폴짝 서버 돌리기
    const apiUrl = "http://localhost:8080/spRequest";
    console.log(apiUrl);
    // console.log("✅ SP_Request 실행됨!");
    // console.log("🌍 API URL:", apiUrl);
    // console.log("📦 보낼 데이터:", sendData);

    const userInfoStr = sessionStorage.getItem('userInfo');
    let userInfo : any;
    if(userInfoStr){
        userInfo = JSON.parse(userInfoStr);
    }

    const userCD = userInfo?.UserCD;
    const OpenUrl = strUrl !== "" ? strUrl : "";

    // try {
    //     const response = await axios.post(apiUrl, [{SpName : SpName, sendData : sendData, userInfo : { UserCD : userCD , OpenUrl : OpenUrl}}]);
    //     return response.data;
    // } catch (error) {
    //     return [{ errMsg: error.message }];
    // }

    try {
        const response = await axios.post(apiUrl, [
            { SpName: SpName, sendData: sendData, userInfo: { UserCD: userCD, OpenUrl: OpenUrl } }
        ],
        {
            withCredentials: true, // ✅ 개별 요청에서 추가
            headers: {
                "Content-Type": "application/json",
            }
        }
    );
        // console.log("✅ SP_Request 응답 성공:", response.data);
        return response.data;
    } catch (error: any) {
        // console.error("❌ SP_Request 요청 실패:", error.message);
        return [{ errMsg: error.message }];
    }    
};


