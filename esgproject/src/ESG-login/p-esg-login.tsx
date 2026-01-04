import React, { useState, useRef, useEffect}  from 'react';
import styles from './p-esg-login.module.css';
import { useNavigate  } from 'react-router-dom';

import PaulZZakLogo from '../assets/image/PaulZZaklogo.png';
// import LoginPicture from '../assets/image/LoginPicture_4.jpg'
import LoginPicture from '../assets/image/Login/MVP202501.jpg'
import Loading from '../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import MessageBoxYesNo from '../ESG-common/MessageBox/p-esg-common-MessageBoxYesNo.tsx';
import MessageBox from '../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';

import { SP_Request } from '../hooks/sp-request.tsx';
import CryptoJS from 'crypto-js';
import emailjs from '@emailjs/browser';

// 메시지 박스
let message : any     = [];
let title   : string  = "";

type FormLoginPageProps = {
  strOpenUrl: any;
};

const LoginPage = ({strOpenUrl}: FormLoginPageProps) => {

    // 쿠키 삭제
    // cookie.remove('userInfo', {path : '/'});
    // cookie.remove('menuList', {path : '/'});
    // cookie.remove('LmenuList', {path : '/'});

    // sessionStorage.removeItem('userInfo');
    // sessionStorage.removeItem('menuList');
    // sessionStorage.removeItem('LmenuList');


    const navigate = useNavigate();

    // 에러메세지
    const [errMsg, setErrMsg] = useState('');

    //로딩바
    const [loading,setLoading] = useState(false);

    // 비밀번호 초기화 버튼
    const [isPassWord, setPassword] = useState(false);

    // 비밀번호 초기화(이메일 양식)
    const [userInfoCheck, setInfo] = useState(false);

    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};    

    // YesNo메세지박스
    const [messageYesNoOpen, setMessageYesNoOpen] = useState(false);
    const messageYesNoClose = () => {setMessageYesNoOpen(false)}; 

    // 아이디, 비밀번호 변수 설정
    const [userID,setUserID] = useState('');
    const [userPW,setUserPW] = useState(''); 
    const [userPWCheck,setUserPWCheck] = useState(''); 
    const [userPWOrigin,setUserPWOrigin] = useState('');

    // 아이디,비밀번호 입력창 포커스
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const passwordChangeInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);
    const idChangeInputRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        const userInfo = sessionStorage.getItem('userInfo');
        if(userInfo !== null){
            navigate('/main');
        }
    },[navigate])

    const inputID = (event: any) => {
        setUserID(event.target.value);
    }

    const inputPW = (event: any) => {
        setUserPW(event.target.value);
    }

    const inputPWCheck = (event: any) => {
        setUserPWCheck(event.target.value);
    }

    const inputOriginPW = (event: any) => {
        setUserPWOrigin(event.target.value);
    }


    // 로그인 SP 결과
    let result : any;

    const activeEnter = (e: any) => {
        if(e.key === "Enter") {
            loginCheck();
        }
    }

    const activeChangeEnter = (e: any) => {
    if(e.key === "Enter") {
        passwordChange();
    }
    }

    //로그인 체크 및 함호화
    const loginCheck = () => {
        setLoading(true);// 로딩창 시작
        if (userID === null || userID === ""){
            setErrMsg("아이디를 입력해주세요.");
            setLoading(false);// 로딩창 종료
            return;
        }else if (userPW === null || userPW === ""){
            setErrMsg("비밀번호를 입력해주세요.");
            setLoading(false);// 로딩창 종료
            return;
        }

        goToMain();
    }

    // 로그인 SP 호출
    const goToMain = async () => {

        const cryptoPW = CryptoJS.SHA256(userPW).toString();
        const checkPW = CryptoJS.SHA256('1234').toString();

        try {
            result = await SP_Request("S_Login_Check", [{userID, cryptoPW, checkPW, DataSet: 'DataSet'}]);
        } catch (error) {
            console.log(error);
        }
        if(result !== null && result[0][0].Status === "0"){
            // 로그인 정보 쿠키 저장
            // const expires = new Date();
            // expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));   // 로그인 유지 시간 24시간
            // cookie.save('userInfo', result[0][0], {
            //     path : '/',
            //     expires,
            //     secure : true,
            //     domain: 'esgplatform.co.kr',
            //     // httpOnly : true
            // });
            sessionStorage.setItem('userInfo',JSON.stringify(result[0][0]));
            // console.log(cookie.load('userid'));

            try{
                const menuResult = await SP_Request("S_Menu_List",[{ UserCD : result[0][0].UserCD , DataSet : 'DataSet'}]);
                if(menuResult !== null && menuResult.length > 0){
                    sessionStorage.setItem('menuList',JSON.stringify(menuResult[0]));
                    sessionStorage.setItem('LmenuList',JSON.stringify(menuResult[1]));
                    // cookie.save('menuList',menuResult[0],{
                    //     path : '/',
                    //     expires,
                    //     secure : true   
                    // });
                    // cookie.save('LmenuList',menuResult[1],{
                    //     path : '/',
                    //     expires,
                    //     secure : true   
                    // });
                    setTimeout(()=>{
                        strOpenUrl("main");
                        setLoading(false);// 로딩창 종료
                        // navigate("main");// 메인 화면 이동
                        window.history.pushState({}, "", "/"); // ✅ 주소만 "/"로 되돌림 (리로드 안 함)
                    },500)
                }else{
                    setLoading(false);// 로딩창 종료
                    navigate("/");// 로그인 이동
                }
            }catch (e){
                console.log(e);
            }

        }else{
            switch(result[0][0].Status){

                //초기화 비밀번호 노출 시 비밀번호 변경 창으로 자동 이동
                case "1" :
                    setUserPW("");
                    setErrMsg(result[0][0].Message);
                    setLoading(false)
                    setInfo(true);
                break;

                //아이디 오류 : 900
                case "900" :
                    setUserID("");
                    setUserPW("");
                    setLoading(false);// 로딩창 종료
                    setPassword(false); // 비밀번호 초기화 버튼 없애기
                    setErrMsg(result[0][0].Message);
                    if(idInputRef.current){
                        idInputRef.current.focus();// 아이디 입력 필드에 포커스
                    }
                break;

                //비밀번호 오류 : 901
                case "901" : 
                    setUserPW("");
                    setLoading(false);// 로딩창 종료
                    // setPassword(true);// 비밀번호 초기화 화면 생성  >> 이건 그냥 비밀번호 까먹었을 경우 초기화하는 걸로 변경
                    setErrMsg(result[0][0].Message);
                    if (passwordInputRef.current) {
                        passwordInputRef.current.focus(); // 비밀번호 입력 필드에 포커스
                    }
                break;

                default:
                    setLoading(false); // 로딩창 종료
                    setErrMsg("로그인에 실패했습니다. 다시 시도해주세요.");
                break;
            }
        }
    }

    // 비밀번호 초기화 로직
    const initPasswordMsg = () => {
        let errMsg : any[] = [];
        errMsg.push({text: userID + " 의 비밀번호를 변경하시겠습니까? 확인 클릭 시 등록된 이메일로 임시 비밀번호가 전송됩니다."});
        message = errMsg;
        title   = "삭제 확인";
        setMessageYesNoOpen(true);
    }

    // 비밀번호 이메일 발송 양식
    const initPassword = async () => {
        messageYesNoClose();
        setErrMsg('');
        // 비밀번호 변경
        const newPW = Math.random().toString(36).substring(2, 11);
        const cryptoPW = CryptoJS.SHA256(newPW).toString();
        try {
            result = await SP_Request("S_Admin_Password_Init", [{userID, cryptoPW, DataSet: 'DataSet'}]);
            if(result){
                setInfo(true);

                // 이메일로 비밀번호 보내기
                emailjs.send('service_m53l826','template_icrfdxr',{
                    to_id: result[0][0].userID,
                    newPW: newPW,
                    to_email: result[0][0].Email
                },{publicKey : "s4ZPyCNiNvQvTYxtZ"})
                    .then(
                        (response) => {
                            console.log('성공',response.status);
                            let errMsg : any[] = [];
                            errMsg.push({text: "임시 비밀번호가 " + userID + "에 등록된 이메일로 전송되었습니다. 이메일 확인 후 즉시 비밀번호를 변경해주세요."});
                            setMessageOpen(true);
                            message = errMsg;
                            title   = "비밀번호 변경";                                
                        },
                        (error) => {
                            console.log('실패', error);
                        },
                    );
            } else{
                let errMsg : any[] = [];
                errMsg.push({text: "비밀번호 변경 실패"})
                setMessageOpen(true);
                message = errMsg;
                title   = "비밀번호 에러";                
            }
        } catch (error) {
            console.log(error);
        }
    }

    const passwordChange = async () => {
        const cryptoPWOrigin = CryptoJS.SHA256(userPWOrigin).toString();
        const cryptoPW = CryptoJS.SHA256(userPW).toString();

        if(userPW !== userPWCheck){
            setErrMsg("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            result = await SP_Request("S_Login_PasswordChange", [{userID, cryptoPWOrigin, cryptoPW, DataSet: 'DataSet'}])

            if(result !== null && result[0][0].Status === "0"){
                let errMsg : any[] = [];
                errMsg.push({text: "비밀번호 변경이 완료 되었습니다."});
                setMessageOpen(true);
                message = errMsg;
                title   = "비밀번호 변경";              
                setInfo(false);
                setErrMsg('');
                setUserPWOrigin('');
                setUserPW('');
                setUserPWCheck('');

            } else{
                switch(result[0][0].Status){
                    //아이디 오류 : 900
                    case "900" :
                        setErrMsg(result[0][0].Message);
                        if(idChangeInputRef.current){
                            idChangeInputRef.current.focus();// 아이디 입력 필드에 포커스
                        }                       

                    break;
    
                    //비밀번호 오류 : 901
                    case "901" : 
                        setErrMsg(result[0][0].Message);
                        if (passwordChangeInputRef.current) {
                            passwordChangeInputRef.current.focus(); // 비밀번호 입력 필드에 포커스
                        }
                    break;

                    //비밀번호 오류 : 902
                    case "902" : 
                        setErrMsg(result[0][0].Message);
                        if (passwordChangeInputRef.current) {
                            passwordChangeInputRef.current.focus(); // 비밀번호 입력 필드에 포커스
                        }
                    break;

                    default:
                        setLoading(false); // 로딩창 종료
                        setErrMsg("로그인에 실패했습니다. 다시 시도해주세요.");
                    break;
                }
            }
        } catch(error){
            console.log(error);
        }
    }

    // ✅ DB ON 구간(요일별 여러 구간 가능) - KST 기준
    // day: 0(일)~6(토)
    type DbSegment = { start: string; end: string };

    const DOW_KR = ["일", "월", "화", "수", "목", "금", "토"];

    /**
     * DB 사용시간 기준
     * 실제 DB켜지는 시간보다 30분 늦게로 설정함. 켜지는 시간이 기니깐..
     * [월요일]
     *  08:30~12:30
     *  23:00~(화)01:30  => 월요일 스케줄에 "23:00~25:30"처럼 표현 (자정 넘어가는 구간)
     *
     * [화~금]
     *  10:00~18:00
     *
     * [토/일]
     *  08:30~12:30
     */
    const DB_ON_SEGMENTS: Record<number, DbSegment[]> = {
        0: [{ start: "09:00", end: "12:30" }],                          // 일
        1: [{ start: "09:00", end: "12:30" }, { start: "23:00", end: "25:30" }], // 월 (01:30 = 25:30)
        2: [{ start: "10:30", end: "18:00" }],                          // 화
        3: [{ start: "10:30", end: "18:00" }],                          // 수
        4: [{ start: "10:30", end: "18:00" }],                          // 목
        5: [{ start: "10:30", end: "18:00" }],                          // 금
        6: [{ start: "09:00", end: "12:30" }],                          // 토
    };

    function toMinutesAllowOver24(hhmm: string) {
        // "25:30" 같이 24시 넘는 표현 허용
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    }

    function nowKstMinutesAndDow() {
        const now = new Date();
        const dow = now.getDay(); // 0~6 (로컬이 KST라고 가정. 사용 환경이 한국이니 OK)
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return { dow, nowMin, now };
    }

    function fmtHHMM(date: Date) {
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }

    function addMinutesToDowTime(dow: number, minutes: number) {
        // minutes가 1440 이상이면 다음날로 넘어감
        const addDays = Math.floor(minutes / 1440);
        const mm = minutes % 1440;
        const ndow = (dow + addDays) % 7;
        const hh = Math.floor(mm / 60);
        const m = mm % 60;
        return { dow: ndow, hhmm: `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
    }

    function getDbStatusText() {
        const { dow, nowMin, now } = nowKstMinutesAndDow();
        const segsToday = DB_ON_SEGMENTS[dow] ?? [];

        // 오늘 세그먼트에 "자정넘김(end>1440)"이 있으면 now가 새벽(0~end-1440)일 때,
        // 사실상 "어제의 23:00~01:30 구간"에 포함될 수 있음.
        // => 전날 세그먼트 중 end가 24시 넘는 구간을 가져와서, nowMin을 1440+nowMin으로 비교
        const prevDow = (dow + 6) % 7;
        const segsPrev = DB_ON_SEGMENTS[prevDow] ?? [];
        const prevCarry = segsPrev.filter(s => toMinutesAllowOver24(s.end) > 1440);

        // 1) 현재 ON 여부 체크
        // - 오늘 세그먼트는 nowMin 그대로 비교
        const onToday = segsToday.some(s => {
            const a = toMinutesAllowOver24(s.start);
            const b = toMinutesAllowOver24(s.end);
            return nowMin >= a && nowMin <= Math.min(b, 1440); // 오늘 범위는 24:00까지만
    });

    function formatAbsRange(segStartAbsMin: number, segEndAbsMin: number) {
        // segStartAbsMin / segEndAbsMin 은 "오늘 0시 기준 abs" (0~2880 범위)
        // 시작/끝을 각각 실제 요일/시간으로 변환해서 "HH:mm ~ (요일)HH:mm" 형태로 만듦
        const startBaseDow = dow; // abs는 "오늘"을 기준으로 잡았으므로, 표시도 dow 기준으로 풀면 됨

        const start = addMinutesToDowTime(startBaseDow, segStartAbsMin);
        const end = addMinutesToDowTime(startBaseDow, segEndAbsMin);

        const startStr = `(${DOW_KR[start.dow]}) ${start.hhmm}`;
        const endStr = end.dow !== start.dow ? `(${DOW_KR[end.dow]}) ${end.hhmm}` : end.hhmm;

        return `${startStr} ~ ${endStr}`;
    }    

    // - 전날에서 넘어온 세그먼트는 nowMin+1440으로 비교
    const onFromPrev = prevCarry.some(s => {
        const a = toMinutesAllowOver24(s.start); // 예: 23:00 = 1380
        const b = toMinutesAllowOver24(s.end);   // 예: 25:30 = 1530
        const x = nowMin + 1440;                 // 오늘 01:00 => 1500 같은 식
        return x >= a && x <= b;
    });

    const isOn = onToday || onFromPrev;

    // 2) 다음 전환(ON->OFF / OFF->ON) 찾기
    // 앞으로 48시간(2일) 정도 훑으면 충분
    // (월요일만 자정넘김이라 24h만으로도 되지만 안전하게 48h)
    type Point = { atAbsMin: number; type: "START" | "END"; srcDow: number; hhmm: string; showDow: number; segStartAbsMin: number; segEndAbsMin: number;};
    const points: Point[] = [];

    for (let d = 0; d < 2; d++) {
        const cdow = (dow + d) % 7;
        const base = d * 1440;
        const segs = DB_ON_SEGMENTS[cdow] ?? [];
        for (const s of segs) {
            const st = toMinutesAllowOver24(s.start);
            const en = toMinutesAllowOver24(s.end);

            const segStartAbsMin = base + st;
            const segEndAbsMin = base + en;

            // start
            {
                const t = base + st;
                const { dow: showDow, hhmm } = addMinutesToDowTime(cdow, st);
                      points.push({
                                    atAbsMin: segStartAbsMin,
                                    type: "START",
                                    srcDow: cdow,
                                    hhmm,
                                    showDow,
                                    segStartAbsMin,
                                    segEndAbsMin,
                                });
            }
            // end (자정 넘기면 cdow+1로 표시될 수 있음)
            {
                const t = base + en;
                const { dow: showDow, hhmm } = addMinutesToDowTime(cdow, en);
                points.push({
                    atAbsMin: segEndAbsMin,
                    type: "END",
                    srcDow: cdow,
                    hhmm,
                    showDow,
                    segStartAbsMin,
                    segEndAbsMin,
                });
            }
        }
    }

    points.sort((a, b) => a.atAbsMin - b.atAbsMin);

    const nowAbs = nowMin; // 현재를 "오늘 0시 기준" abs로 둠
    // 전날 carry로 ON인 케이스는 nowAbs를 1440+nowMin으로 봐야 다음 END를 제대로 찾음
    const nowAbsForSearch = onFromPrev ? nowMin + 1440 : nowAbs;

    const nextPoint = points.find(p => p.atAbsMin > nowAbsForSearch);

    // 오늘 운영시간 문자열
    const todayText = segsToday.length
        ? segsToday
            .map(s => {
            // 25:30 같이 보이면 사용자 혼동 => 표시할 때는 다음날 01:30로 표기
            const st = toMinutesAllowOver24(s.start);
            const en = toMinutesAllowOver24(s.end);
            const stDisp = addMinutesToDowTime(dow, st);
            const enDisp = addMinutesToDowTime(dow, en);
            const enStr = enDisp.dow !== dow ? `(${DOW_KR[enDisp.dow]}) ${enDisp.hhmm}` : enDisp.hhmm;
            return `${stDisp.hhmm} ~ ${enStr}`;
            })
            .join(" / ")
        : "오늘은 운영시간이 없습니다.";

    const nowStr = fmtHHMM(now);

    if (!nextPoint) {
        return {
        title: isOn ? "현재 홈페이지 이용 가능" : "현재 홈페이지 이용 불가",
        // desc: `오늘(${DOW_KR[dow]}) 운영시간: ${todayText} · 현재 시간: (${DOW_KR[dow]}) ${nowStr}`,
        desc: `오늘(${DOW_KR[dow]}) 운영시간: ${todayText}`,
        };
    }

    const nextText =
        nextPoint.type === "END"
        ? `다음 종료: (${DOW_KR[nextPoint.showDow]}) ${nextPoint.hhmm}`
        : `다음 시작: ${formatAbsRange(nextPoint.segStartAbsMin, nextPoint.segEndAbsMin)}`;

    return {
        title: isOn ? "현재 홈페이지 이용 가능" : "현재 홈페이지 이용 불가",
        // desc: `오늘(${DOW_KR[dow]}) 운영시간: ${todayText} · ${nextText} · 현재 시간: (${DOW_KR[dow]}) ${nowStr}`,
        desc: `오늘(${DOW_KR[dow]}) 운영시간: ${todayText} · ${nextText}`,
    };
    }

    function DbTimeNotice({ className }: { className?: string }) {
        const { title, desc } = getDbStatusText();

        return (
            <div className={className}>
            <div className="dbNoticeTitle">{title}</div>
            <div className="dbNoticeDesc">{desc}</div>
            </div>
        );
    }


    return (
        <>
            <Loading loading={loading}/>
            <MessageBoxYesNo messageYesNoOpen = {messageYesNoOpen} btnYes = {initPassword} btnNo = {messageYesNoClose} MessageData = {message} Title={title}/>
            <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
            <div className = {styles.LoginContainer}>
                <div className = {styles.LoginWrap}>
                    <div className = {styles.LoginLeft}>
                        <img className = {styles.LoginPicture} src={LoginPicture} alt={"LoginPicture"}/>                        
                    </div>
                    <div className = {styles.LoginRight}>
                        <div className = {styles.LoginRightWrap} style={{top: userInfoCheck ? '7%' : ''}}>
                            <div className={styles.LogoWrap}>
                                <img className = {styles.Logo} src={PaulZZakLogo} alt={"EYLogo"}></img>
                            </div>
                            {!userInfoCheck && 
                            <div>
                                <form onSubmit={(e) => { e.preventDefault(); loginCheck(); }}>
                                    <div className={styles.LoginInputWrap}>
                                        <input type="text" className = {styles.LoginInput} placeholder="사용자ID" value={userID} onChange={inputID} onKeyDown={(e) => activeEnter(e)} ref={idInputRef}></input>
                                        <input type="password" className = {styles.LoginInput} placeholder="패스워드" value={userPW} onChange={inputPW} onKeyDown={(e) => activeEnter(e)} ref={passwordInputRef} autoComplete="off"></input>
                                        <div className={styles.loginAlert}>{errMsg}</div>
                                        <button type="submit" className={styles.LoginBtn}>로그인</button>
                                        {isPassWord && <div className={styles.initPassword} onClick={initPasswordMsg}>비밀번호 초기화</div>}
                                    </div>
                                </form>                                
                                {/* <div className={styles.LoginInputWrap}>
                                    <input type="text" className = {styles.LoginInput} placeholder="사용자ID" value={userID} onChange={inputID} onKeyDown={(e) => activeEnter(e)} ref={idInputRef}></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="패스워드" value={userPW} onChange={inputPW} onKeyDown={(e) => activeEnter(e)} ref={passwordInputRef} autoComplete="off"></input>
                                    <div className={styles.loginAlert}>{errMsg}</div>
                                    <button className = {styles.LoginBtn} onClick={loginCheck}>로그인</button>
                                    {isPassWord && <div className = {styles.initPassword} onClick={initPasswordMsg}>비밀번호 초기화</div>}
                                </div> */}
                                <div className={styles.copyright}>
                                    Copyright © 2025.PaulZZak Platform. All rights reserved
                                </div>
                            </div>
                            }
                            {userInfoCheck && 
                            <div>
                                <div className={styles.LoginInputWrapChange}>
                                    <input type="text" className = {styles.LoginInput} placeholder="사용자ID" value={userID} onChange={inputID} onKeyDown={(e) => activeChangeEnter(e)} ref={idChangeInputRef}></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="현재 비밀번호" value={userPWOrigin} onChange={inputOriginPW} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef} autoComplete="off"></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="새 비밀번호" value={userPW} onChange={inputPW} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef} autoComplete="off"></input>
                                    <input type="password" className = {styles.LoginInput} placeholder="새 비밀번호 확인" value={userPWCheck} onChange={inputPWCheck} onKeyDown={(e) => activeChangeEnter(e)} ref={passwordChangeInputRef} ></input>
                                    <div className={styles.loginAlert}>{errMsg}</div>
                                    <button className = {styles.LoginBtn} onClick={passwordChange}>비밀번호 변경</button>
                                </div>
                                <div className={styles.copyrightSub} style={{paddingLeft:"57px"}}>
                                    Copyright © 2025.PaulZZak Platform. All rights reserved
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                    
                </div>
                  {/* DB 실행 시간  */}
                  <div className={styles.DbTimeNoticeWrap}>
                    <DbTimeNotice className={styles.DbTimeNotice} />
                  </div>
                {/* 모바일 하단 고정 로고 */}
                <div className={styles.MobileFooterLogo}>
                    <img src={PaulZZakLogo} alt="PaulZZakLogo" />
                </div>
            </div>
        </>
    )
}

export default LoginPage