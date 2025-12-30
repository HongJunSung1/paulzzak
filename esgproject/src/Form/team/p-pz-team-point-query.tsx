// 시즌별 팀 순위 및 MVP랭킹 조회
import React, {useMemo, useRef, useState, useEffect }  from 'react'
import '../../global.d.ts';
import styles from './p-pz-team-point-query.module.css';

//공통 소스
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Splitter from "../../ESG-common/Splitter/p-esg-common-Splitter.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import MessageBox from '../../ESG-common/MessageBox/p-esg-common-MessageBox.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    SeasonCD : number;
    DataSet  : string;
}

// 에러 메세지
let message : any     = [];
let title   : string  = "";

type FormTeamPointProps = {
  strOpenUrl: any;
  openTabs: any;
};

const TeamPointForm = ({strOpenUrl, openTabs}: FormTeamPointProps)=> {
    // 로딩뷰
    const [loading,setLoading] = useState(false);
    
    // 메세지박스
    const [messageOpen, setMessageOpen] = useState(false)
    const messageClose = () => {setMessageOpen(false)};

    // 조회조건 값
    const [SeasonCD, setSeasonCD] = useState(0);

    // 조회 시 받는 데이터 값
    const [grid1Data, setGrid1Data] = useState([]);
    const [grid2Data, setGrid2Data] = useState([]);

    // 저장 시 넘기는 컬럼 값
    let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});
    let [grid2Changes, setGrid2Changes] = useState<gridAr>({ DataSet : '', grid: []});
    
    // 화면이 세로형일 때는 이렇게 하는 게 맞음
    const dynRef = useRef<HTMLDivElement | null>(null);
    const applyingRef = useRef(false);
    const rafId = useRef<number | null>(null);
    const last = useRef({ h: 0, h1: 0, h2: 0 });    

    // 저장 시 시트 변화 값 감지
    const handleGridChange = (gridId: string, changes: gridAr) => {
        if (gridId === 'DataSet1') {
            setGrid1Changes(changes);
        } else if (gridId === 'DataSet2') {
            setGrid2Changes(changes);
        } 
    };
    
    // 삭제 시 넘기는 컬럼 값
    const grid1Ref : any = useRef(null);
    const grid2Ref : any = useRef(null);  

    const toolbar = [  
        {id: 0, title:"신규", image:"new"  , spName:""}
      , {id: 1, title:"조회", image:"query", spName:"S_PZ_Season_TeamPoint_Query"}
    ]

    // 헤더 정보
    const headerOptions = useMemo(() => {
      const complexColumns: any[] = [];
      return {
        height: 30,
        complexColumns: complexColumns.length > 0 ? complexColumns : undefined,
      };
    }, []);

    const columns1 = useMemo(() => ([
        {name : "SeasonCD"  , header: "시즌코드"   , width:  70, hidden: true },
        {name : "TeamCD"    , header: "팀코드"     , width: 250, hidden: true},
        {name : "TeamName"  , header: "팀명"       , width:  80},
        {name : "Win"       , header: "승"         , width:  40},
        {name : "Draw"      , header: "무"         , width:  40},
        {name : "Lose"      , header: "패"         , width:  40},
        {name : "ScorePoint", header: "득실차"     , width:  40},
        {name : "TeamPoint" , header: "승점"       , width:  40},
    ]), []);

    const columns2 = useMemo(() => ([
        {name : "UserCD"        , header: "내부코드"    , width:  70, hidden: true},
        {name : "UserName"      , header: "이름"        , width:  60},
        {name : "RankingPoint"  , header: "랭킹점수"    , width:  80, renderer : {type: 'number'}, sortable: true},
        {name : "AttendRatio"   , header: "참석율(%)"   , width: 100, renderer : {type: 'number'}, sortable: true},
        {name : "Score"         , header: "득점"        , width:  80, renderer : {type: 'number'}, sortable: true},
        {name : "Rebound"       , header: "리바운드"    , width:  80, renderer : {type: 'number'}, sortable: true},
        {name : "Assist"        , header: "어시스트"    , width:  80, renderer : {type: 'number'}, sortable: true},
        {name : "Steal"         , header: "스틸"        , width:  80, renderer : {type: 'number'}, sortable: true},
        {name : "Block"         , header: "블로킹"      , width:  80, renderer : {type: 'number'}, sortable: true},
        {name : "TurnOver"      , header: "턴오버"      , width:  80, renderer : {type: 'number'}, sortable: true, hidden: true},
    ]), []);


    // 툴바 이벤트
    const toolbarEvent = async (clickID: any) =>{
        switch(clickID){
            // 신규
            case 0:
                grid1Ref.current.clear();
                grid2Ref.current.clear();
                setGrid1Data([]);
                setGrid2Data([]);

                break;

            // 조회
            case 1: 

                // 조회 조건 담기
                const conditionAr : condition = ({
                    SeasonCD : SeasonCD,
                    DataSet  : 'DataSet1'
                })     

                // 로딩 뷰 보이기
                setLoading(true);
                try {
                    
                    if(conditionAr.SeasonCD === 0){
                        message  = [];
                        message.push({text: "시즌을 선택해주세요."});
                        setMessageOpen(true);
                        title   = "조회 오류";
                        setLoading(false);
                        return
                    }

                    // 조회 SP 호출 후 결과 값 담기
                    const result = await SP_Request(toolbar[clickID].spName, [conditionAr]);


                    if(result[0].length > 0){
                        // 결과값이 있을 경우 그리드에 뿌려주기
                        // 조회 버튼으로는 대메뉴 조회만 나와야 하기 때문에 result[0]만 뿌려줌
                        setGrid1Data(result[0]);
                        setGrid2Data(result[1])
                    } else{
                        // 결과값이 없을 경우 처리 로직
                        // 조회 결과 초기화
                        setGrid1Data([]);
                        setGrid2Data([]);

                        message  = [];
                        message.push({text: "조회 결과가 없습니다."})
                        setMessageOpen(true);
                        title   = "조회 오류";
                        setLoading(false);
                    }
                } catch (error) {
                    // SP 호출 시 에러 처리 로직
                    console.log(error);
                }
                // 로딩뷰 감추기
                setLoading(false);

            break;
        }
    }

    // ResizeObserver로 “실제 px 높이” 감지 → Grid 높이 강제
    useEffect(() => {
    if (strOpenUrl !== '/PPzTeamPointQuery') return;
    const el = dynRef.current;
    if (!el) return;

    const getG1 = () => grid1Ref.current?.getInstance?.();
    const getG2 = () => grid2Ref.current?.getInstance?.();

    const apply = () => {
        rafId.current = null;
        if (!el) return;

        const h = el.getBoundingClientRect().height; // clientHeight보다 안정적인 경우 많음
        if (!h) return;

        // ✅ 1~2px 미세 흔들림은 무시 (빈 데이터일 때 특히 발생)
        if (Math.abs(h - last.current.h) < 3) return;

        const h1 = Math.max(180, Math.floor(h * 0.33));
        const h2 = Math.max(240, Math.floor(h - h1));

        // ✅ 이전과 사실상 같으면 아무것도 하지 않음
        if (Math.abs(h1 - last.current.h1) < 3 && Math.abs(h2 - last.current.h2) < 3) {
        last.current.h = h;
        return;
        }

        applyingRef.current = true;
        last.current = { h, h1, h2 };

        const g1 = getG1();
        const g2 = getG2();

        g1?.setHeight?.(h1);
        g2?.setHeight?.(h2);

        g1?.refreshLayout?.();
        g2?.refreshLayout?.();

        // ✅ setHeight/refreshLayout로 발생한 ResizeObserver 재호출을 잠깐 무시
        requestAnimationFrame(() => {
        applyingRef.current = false;
        });
    };

    const schedule = () => {
        if (applyingRef.current) return;      // ✅ 내가 바꾸는 중엔 무시 (루프 차단)
        if (rafId.current != null) return;    // ✅ 1프레임 1회
        rafId.current = requestAnimationFrame(apply);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    // 최초 1회
    schedule();

    return () => {
        ro.disconnect();
        if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
    }, [strOpenUrl]);

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {
        const grid1Inst = grid1Ref.current.getInstance();
        const grid2Inst = grid2Ref.current.getInstance();

        if(ref === grid1Inst){
            grid2Ref.current.blur();
        }else if (ref === grid2Inst){
            grid1Ref.current.blur();
        }
    }

    // 탭에서 화면이 사라졌을 경우 화면 값 초기화
    useEffect(() => {
        if (openTabs.find((item: any) => item.url === '/PPzTeamPointQuery') === undefined) {
            setGrid1Data([]);
            setGrid2Data([]);
        }
    }, [openTabs]); 

    useEffect(() => {
    if (strOpenUrl !== '/PPzTeamPointQuery') return;

    const raf = requestAnimationFrame(() => {
        const g1 = grid1Ref.current?.getInstance?.();
        const g2 = grid2Ref.current?.getInstance?.();
        g1?.refreshLayout?.();
        g2?.refreshLayout?.();
    });

    const onResize = () => {
        const g1 = grid1Ref.current?.getInstance?.();
        const g2 = grid2Ref.current?.getInstance?.();
        g1?.refreshLayout?.();
        g2?.refreshLayout?.();
    };

    window.addEventListener('resize', onResize);
    return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
    };
    }, [strOpenUrl]);

    useEffect(() => {
    if (strOpenUrl !== '/PPzTeamPointQuery') return;

    const raf = requestAnimationFrame(() => {
        grid1Ref.current?.getInstance?.()?.refreshLayout?.();
        grid2Ref.current?.getInstance?.()?.refreshLayout?.();
    });

    return () => cancelAnimationFrame(raf);
    }, [strOpenUrl, grid1Data, grid2Data]);


   return (
        <>
            <div style={{top: 0 ,height:"100%", display : strOpenUrl === '/PPzTeamPointQuery' ? "flex" : "none", flexDirection:"column"}}>
                <Loading loading={loading}/>
                <MessageBox messageOpen = {messageOpen} messageClose = {messageClose} MessageData = {message} Title={title}/>
                <Toolbar items={toolbar} clickID={toolbarEvent}/> 
                <FixedArea name={"조회조건"}>
                    <FixedWrap>
                        <div className={styles.fixedFull}>
                            <div className={styles.condWrap}>
                                <SearchBox name={"시즌명"}  value={SeasonCD} isRequire={"true"} onChange={(val : any) => setSeasonCD(val.code)} width={200} searchCode={6} isGrid={false}/>
                                <span className={styles.rankHint}>
                                    ※ 랭킹점수 산출 방법 : 출석율(%) x [(득점 x 1.3) x (리바운드 x 1.3) + (어시스트 x 1.2) + (스틸 x 1.1) + (블로킹 x 1.1)]
                                </span>
                            </div>
                            {/* <span style={{marginLeft: "10px", marginTop:"27px", fontSize: "12px"}} className={styles.KeyIndex}>
                                ※ 랭킹점수 산출 방법 : 출석율(%) x [(득점 x 1.3) x (리바운드 x 1.3) + (어시스트 x 1.2) + (스틸 x 1.1) + (블로킹 x 1.1)]
                            </span> */}
                        </div>
                    </FixedWrap>
                </FixedArea>  
                <DynamicArea>
                    <div ref={dynRef} className={styles.dynWrap}>
                        <Splitter SplitType={"vertical"} FirstSize={33} SecondSize={67}>
                            <Grid ref={grid1Ref} gridId="DataSet1" title = "팀 순위" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                            <Grid ref={grid2Ref} gridId="DataSet2" title = "MVP랭킹" source = {grid2Data} headerOptions={headerOptions} columns = {columns2} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                        </Splitter>
                    </div>
                </DynamicArea>
            </div>
        </>
    )
}

export default TeamPointForm;