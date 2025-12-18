import React,{useMemo, useState, useRef, useEffect} from 'react'
import Chart from '../../ESG-common/Chart/p-pz-common-chart.tsx';
import styles from './p-esg-form-main.module.css';
import Toolbar from "../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx";
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import DynamicArea from "../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx";
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';
import FixedArea from "../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx";
import FixedWrap from "../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx";
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import { ApexOptions } from 'apexcharts';

import '../../global.d.ts';

type gridAr = {
    DataSet    : string;
    grid       : any[];
};

type condition = {
    SeasonCD   : number;
    DataSet    : string;
}  

type FormMainProps = {
  strOpenUrl: any;
  openTabs: any;
};

const Main = ({strOpenUrl, openTabs}: FormMainProps) => {
  // 로딩뷰
  const [loading,setLoading] = useState(false);

  // 최초 1회에는 자동 조회 쿼리 
  const IsFirstEnter = useRef(true);

  // 조회조건 값
  const [SeasonCD, setSeasonCD] = useState(0);

  // 조회 시 받는 데이터 값
  const [grid1Data, setGrid1Data] = useState([]);

  // 최상단 데이터들
  // 1. 출석률 도넛차트
  const [attendanceChartData, setAttendanceChartData] = useState<{
    series: number[];
    options: ApexOptions;
  }>({
    series: [],
    options: {
      chart: {
        type: 'donut'
      }
    },
  }); 

  // 2. 회원동향 꺾은선 그래프
  const [memberLineChart, setMemberLineChart] =  useState<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>({
    series: [],
    options: {
      chart: {
        type: 'line'
      }
    },
  }); 

  // 3. 개인별 공격 지표 추이 꺾은선 그래프
  const [offenseStatsLineChart, setOffenseStatsLineChart] =  useState<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>({
    series: [],
    options: {
      chart: {
        type: 'line'
      }
    },
  }); 

  // 4. 개인별 수비 지표 추이 꺾은선 그래프
  const [defenseStatsLineChart, setDefenseStatsLineChart] =  useState<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>({
    series: [],
    options: {
      chart: {
        type: 'line'
      }
    },
  });   

  const [AVGPointFirstName, setAVGPointFirstName] = useState('');
  const [AVGPointUserID, setAVGPointUserID] = useState('');
  const [ImageAVGPointUser, setImageAVGPointUser] = useState('');
  const DefaultImage = require(`../../assets/profile/default.png`);

  // 차트 사이즈 결정짓는 요소들 ---------------------------------------------------------
  const AverageAttend = useRef<HTMLDivElement>(null);
  const LineChartAttend = useRef<HTMLDivElement>(null);
  const LineChartOffenseStats = useRef<HTMLDivElement>(null);
  const LineChartDefenseStats = useRef<HTMLDivElement>(null);

  const [averageAttendSize, setAverageAttendSize] = useState({ width: 0, height: 0 });
  const [lineChartAttendSize, setLineChartAttendSize] = useState({ width: 0, height: 0 });
  const [lineChartOffenseStatsSize, setLineChartOffenseStatsSize] = useState({ width: 0, height: 0});
  const [lineChartDefenseStatsSize, setLineChartDefenseStatsSize] = useState({ width: 0, height: 0});

  // 개인기록 ---------------------------------------------------------
  const [personalWin       , setPersonalWin]      = useState(0);
  const [personalLose      , setPersonalLose]     = useState(0);
  const [personalDraw      , setPersonalDraw]     = useState(0);
  const [personalScore     , setPersonalScore]    = useState(0);
  const [personalAssist    , setPersonalAssist]   = useState(0);
  const [personalRebound   , setPersonalRebound]  = useState(0);
  const [personalBlock     , setPersonalBlock]    = useState(0);
  const [personalSteal     , setPersonalSteal]    = useState(0);
  const [personalFoul      , setPersonalFoul]     = useState(0);
  const [personalTurnOver  , setPersonalTurnOver] = useState(0);

  // Top5 기록 --------------------------------------------------------
type TopScorer = {
  UserName: string;
  Score: number;
};
type TopAssist = {
  UserName: string;
  Assist: number;
};
type TopRebound = {
  UserName: string;
  Rebound: number;
};
type TopSteal = {
  UserName: string;
  Steal: number;
};
const [topScorer, setTopScorer] = useState<TopScorer[]>([]);
const [topAssist, setTopAssist] = useState<TopAssist[]>([]);
const [topRebound, setTopRebound] = useState<TopRebound[]>([]);
const [topSteal, setTopSteal] = useState<TopSteal[]>([]);

// 화면에서 사이즈 조회
useEffect(() => {
  if (AverageAttend.current) {
    const attendObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setAverageAttendSize({ width, height });
        }
      }
    });
    attendObserver.observe(AverageAttend.current);
    return () => attendObserver.disconnect();
  }
}, []);

useEffect(() => {
  if (LineChartAttend.current) {
    const lineObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setLineChartAttendSize({ width, height });
        }
      }
    });
    lineObserver.observe(LineChartAttend.current);
    return () => lineObserver.disconnect();
  }
}, []);

useEffect(() => {
  if (LineChartOffenseStats.current) {
    const lineObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setLineChartOffenseStatsSize({ width, height });
        }
      }
    });
    lineObserver.observe(LineChartOffenseStats.current);
    return () => lineObserver.disconnect();
  }
}, []);

useEffect(() => {
  if (LineChartDefenseStats.current) {
    const lineObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setLineChartDefenseStatsSize({ width, height });
        }
      }
    });
    lineObserver.observe(LineChartDefenseStats.current);
    return () => lineObserver.disconnect();
  }
}, []);

// 출석률
const makeAttendanceChart = (attend: number, absent: number) => {
  return {
    series: [attend, absent],
    options: {
      chart: {
        type: 'donut' as const,
        width: '100',
        height: 200,
        background: 'transparent',
      },
      labels: ['출석', '불참'],
      colors: ['#1e2a78', '#CFCFCF'], // 각 차트 색깔
      legend: { show: false },
      dataLabels: {
        enabled: false, // 각 조각 수치 안보이게 하기
        style: {
          colors: ['#000'],
          fontWeight: 600,
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}%`,
        },
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                fontWeight: 300,
                // color: '#333',
                // offsetY: -5,
              },
              value: {
                show: true,
                fontSize: '40px',
                fontWeight: 800,
                offsetY: 15,
                formatter: (val: string) => `${val}%`,
              },
              total: {
                show: true,
                label: '',
                fontSize: '12px',
                fontWeight: 600,
                // offsetY: -10,
                // formatter: function (w) {
                //   return '75%'; // 여기를 attend 값으로 바꾸면 됨
                // }
                formatter: () => `${attend}%`, //이게 진짜
              },
            },
          },
        },
      },
      stroke: { show: false },
    },
  };
};

//회원동향(회원 수, 참석자 수, 불참자 수)
const makeMemberLineChart = (rawData: any): {
  series: { name: string; data: number[] }[];
  options: ApexOptions;
} | null => {
  if (!rawData || rawData.length === 0) return null;

  const sorted = [...rawData].sort((a, b) =>
    new Date(b.GameDate).getTime() - new Date(a.GameDate).getTime()
  );

  const sliced = sorted.slice(0, 5);

  const totalSeries = sliced.map((row) => Number(row.TotalCnt));
  const attendSeries = sliced.map((row) => Number(row.AttendCnt));
  const absentSeries = sliced.map((row) => Number(row.AbsentCnt));

  return {
    series: [
      { name: '회원 수', data: totalSeries },
      { name: '참석자 수', data: attendSeries },
      { name: '불참자 수', data: absentSeries },
    ],
    options: {
      chart: {
        type: 'line' as const,
        offsetX : 0,
        height: 200,
        background: 'transparent',
        toolbar: { show: false },
        zoom: {enabled: false}, // 줌(확대) 기능 
      },
      grid: {
        padding: {
          left: 10,
          right: 5,  
          top: -10,
          bottom: 0,
        },
      },
      xaxis: {
        categories: sliced.map(row => row.GameDate),
        title: { text: '' },
        labels: {
            rotate: 0, // ✅ 수평 정렬
            style: {
              fontSize: '10px', // ✅ 작은 글씨
              fontWeight: 500,
            },
        },        
      },
      yaxis: {
        title: { text: '' },
        min: 0,
        labels: {
          style: {
            fontSize: '10px',
          }
        }
      },
      stroke: { curve: 'smooth', width: 5 },
      markers: { size: 4, strokeWidth: 0 }, //strokeWidth: 값 동그라미 테두리 색 제거
      tooltip: { shared: true, intersect: false },
      colors: ['#4C78A8', '#3E3E3E', '#CFCFCF'],
      legend: {
        show: false,
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
      },
    },
  };
};

// 개인별 득점, 어시스트 추이 차트
const makeOffenseLineChart = (rawData: any): {
  series: { name: string; data: number[] }[];
  options: ApexOptions;
} | null => {
  if (!rawData || rawData.length === 0) return null;

  const sorted = [...rawData].sort((a, b) =>
    new Date(b.GameDate).getTime() - new Date(a.GameDate).getTime()
  );

  const sliced = sorted.slice(0, 5).reverse(); // 내림차순으로 데이터를 가져왔기 때문에 다시 되돌림

  const score = sliced.map((row) => Number(row.Score));
  const assist = sliced.map((row) => Number(row.Assist));

  return {
    series: [
      { name: '득점', data: score },
      { name: '어시스트', data: assist },
    ],
    options: {
      chart: {
        type: 'line' as const,
        offsetX : 0,
        height: 180,
        background: 'transparent',
        toolbar: { show: false },
        zoom: {enabled: false}, // 줌(확대) 기능 
      },
      grid: {
        padding: {
          left: 10,
          right: 5,  
          top: -10,
          bottom: 0,
        },
      },
      xaxis: {
        categories: sliced.map(row => row.GameDate),
        title: { text: '' },
        labels: {
            rotate: 0, // ✅ 수평 정렬
            style: {
              fontSize: '10px', // ✅ 작은 글씨
              fontWeight: 500,
            },
        },        
      },
      yaxis: {
        title: { text: '' },
        min: 0,
        labels: {
          style: {
            fontSize: '10px',
          }
        }
      },
      stroke: { curve: 'smooth', width: 5 },
      markers: { size: 4, strokeWidth: 0 }, //strokeWidth: 값 동그라미 테두리 색 제거
      tooltip: { shared: true, intersect: false },
      colors: ['#4C78A8', '#3E3E3E'],
      legend: {
        show: false,
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
      },
    },
  };
};

// 개인별 리바운드, 스틸 추이 차트
const makeDefenseLineChart = (rawData: any): {
  series: { name: string; data: number[] }[];
  options: ApexOptions;
} | null => {
  if (!rawData || rawData.length === 0) return null;

  const sorted = [...rawData].sort((a, b) =>
    new Date(b.GameDate).getTime() - new Date(a.GameDate).getTime()
  );

  const sliced = sorted.slice(0, 5).reverse(); // 내림차순으로 데이터를 가져왔기 때문에 다시 되돌림

  const rebound = sliced.map((row) => Number(row.Rebound));
  const steal = sliced.map((row) => Number(row.Steal));

  return {
    series: [
      { name: '리바운드', data: rebound },
      { name: '스틸', data: steal },
    ],
    options: {
      chart: {
        type: 'line' as const,
        offsetX : 0,
        height: 180,
        background: 'transparent',
        toolbar: { show: false },
        zoom: {enabled: false}, // 줌(확대) 기능 
      },
      grid: {
        padding: {
          left: 10,
          right: 5,  
          top: -10,
          bottom: 0,
        },
      },
      xaxis: {
        categories: sliced.map(row => row.GameDate),
        title: { text: '' },
        labels: {
            rotate: 0, // ✅ 수평 정렬
            style: {
              fontSize: '10px', // ✅ 작은 글씨
              fontWeight: 500,
            },
        },        
      },
      yaxis: {
        title: { text: '' },
        min: 0,
        labels: {
          style: {
            fontSize: '10px',
          }
        }
      },
      stroke: { curve: 'smooth', width: 5 },
      markers: { size: 4, strokeWidth: 0 }, //strokeWidth: 값 동그라미 테두리 색 제거
      tooltip: { shared: true, intersect: false },
      colors: ['#4C78A8', '#3E3E3E'],
      legend: {
        show: false,
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
      },
    },
  };
};

// ---------------------------------------------------------------------------------------
  
  // 삭제 시 넘기는 컬럼 값
  const grid1Ref : any = useRef(null);
  // 저장 시 넘기는 컬럼 값
  let [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet : '', grid: []});

  // 저장 시 시트 변화 값 감지
  const handleGridChange = (gridId: string, changes: gridAr) => {
      if (gridId === 'DataSet1') {
          setGrid1Changes(changes);
      } 
  };

  // 툴바
  const toolbar = [  
    {id: 0, title:"조회", image:"query", spName:""}
  ]
  // 헤더 정보
  
  const headerOptions = useMemo(() => {
    const complexColumns: any[] = [];
    return{
      height: 60,
      complexColumns: complexColumns.length > 0 ? complexColumns : undefined
    }
  }, []);

  // 시트 컬럼 값
  const columns1 = [
    {name : "UserCD"    , header: "유저코드"   , width:  70, hidden: true},
    {name : "UserName"  , header: "이름"       , width:  80, sortable: true},
    {name : "UserID"    , header: "유저ID"     , width:  80, hidden: true},
    {name : "MatchCnt"  , header: "경기 수"    , width:  80, sortable: true},
    {name : "Score"     , header: "득점"       , width:  80, sortable: true},
    {name : "Assist"    , header: "어시스트"   , width:  80, sortable: true},
    {name : "Rebound"   , header: "리바운드"   , width:  80, sortable: true},
    {name : "Block"     , header: "블로킹"     , width:  80, sortable: true},
    {name : "Steal"     , header: "스틸"       , width:  80, sortable: true},
    {name : "Foul"      , header: "파울"       , width:  80, sortable: true},
    {name : "TurnOver"  , header: "턴오버"     , width:  80, sortable: true},
  ];

const toolbarEvent = async (clickID: any) =>{
  switch(clickID){
    case 0: 
      // 조회 조건 담기
      const conditionAr : condition = ({
        SeasonCD : SeasonCD,
        DataSet  : 'DataSet1'
      })
      MainQuery(conditionAr);
    break;
  }
}


    const MainQuery = (conditionAr: any) => {
      setTimeout(async () => {
        // 로딩 뷰 보이기
        setLoading(true);        
        try {
            // 조회 SP 호출 후 결과 값 담기
            const result = await SP_Request("S_PZ_Main_Query", [conditionAr]);
            // 1. 출석률
            if(result[0].length > 0){
              const row = result[0][0];
              const attend = Number(row.AttendRate) ?? 0;
              const absent = Number(row.AbsentRate) ?? 0;

              setAttendanceChartData(makeAttendanceChart(attend, absent));
              // 평균득점
              // 1. 이미지
              // setAVGPointUserID(result[0][0].UserID);      // 아이디값
              // setAVGPointFirstName(result[0][0].UserName); // 이름           
            } 
            // 2. 회원 동향
            if(result[1].length > 0){
              const row = result[1];
              setMemberLineChart(makeMemberLineChart(row));
            }

            // 3. 개인별 추이(득점/어시스트, 리바/스틸)
            if(result[2].length > 0){
              const row = result[2];
              setOffenseStatsLineChart(makeOffenseLineChart(row));
              setDefenseStatsLineChart(makeDefenseLineChart(row));
            }
            // 개인 기록
            if(result[3].length > 0){
              setPersonalWin(result[3][0].Win);   
              setPersonalLose(result[3][0].Lose);
              setPersonalDraw(result[3][0].Draw);
              setPersonalScore(result[3][0].Score);
              setPersonalAssist(result[3][0].Assist);
              setPersonalRebound(result[3][0].Rebound);
              setPersonalBlock(result[3][0].Block);
              setPersonalSteal(result[3][0].Steal);
              setPersonalFoul(result[3][0].Foul);
              setPersonalTurnOver(result[3][0].TurnOver); 
            }
            if(result[4].length > 0){
              setGrid1Data(result[4]);
            } else{
              setGrid1Data([]);
            }
            if(result[5].length > 0){
              setTopScorer(result[5]);
            } 
            if(result[6].length > 0){
              setTopAssist(result[6]);
            } 
            if(result[7].length > 0){
              setTopRebound(result[7]);
            } 
            if(result[8].length > 0){
              setTopSteal(result[8]);
            } 
        } catch (error) {
            // SP 호출 시 에러 처리 로직
            console.log(error);
        }
        setLoading(false);
      })
    }

    useEffect(() => {
      if (
        strOpenUrl === '/main' &&
        IsFirstEnter.current &&
        averageAttendSize.width > 0 &&
        lineChartAttendSize.width > 0 &&
        lineChartOffenseStatsSize.width > 0 &&
        lineChartDefenseStatsSize.width > 0
      ) {

        const conditionAr : condition = ({
          SeasonCD : 0,
          DataSet  : 'DataSet1'
        })

        MainQuery(conditionAr);
        // 이건 데이터 확인용 임시로 진행 - DB 돌릴 때는 이거 지우고 MainQuery 에서 진행
                // const attend = 65;
                // const absent = 25;
                // const dormant = 10;
                // setAttendanceChartData(makeAttendanceChart(attend, absent, dormant));        
        IsFirstEnter.current = false;
      }
    }, [strOpenUrl, averageAttendSize.width, lineChartAttendSize.width, lineChartOffenseStatsSize.width, lineChartDefenseStatsSize.width]);


    useEffect(() => {
      if (AVGPointUserID) {
        try {
          const img = require(`../../assets/profile/${AVGPointUserID}.png`);
          setImageAVGPointUser(img);
        } catch (e) {
          const fallback = require(`../../assets/profile/default.png`);
          setImageAVGPointUser(fallback);
        }
      } 
    }, [AVGPointUserID]);

    // 시트 클릭시 나머지 시트 포커스 해제
    const gridClick = (ref : any) => {
        ;
    }


    return(
        <div style={{ top: 0 ,height:"100%", display: strOpenUrl.replace('/', '') === 'main' ? "flex" : "none", flexDirection:"column"}}>
          <Loading loading={loading}/>
          <Toolbar items={toolbar} clickID={toolbarEvent}/> 
          <FixedArea name={"조회 조건"}>
            <FixedWrap>
              <SearchBox name={"시즌명"}  value={SeasonCD} isRequire={"false"} onChange={(val: any) => setSeasonCD(val.code)} width={200} searchCode={6} isGrid={false}/>
            </FixedWrap>
          </FixedArea>  
          <div className={styles.mainDashboard}>
            {/* 최상단: 좌측 요약 + 우측 TOP5 */}
            <div className={styles.topSummary}>
              <div className={styles.topAttend}>
                <div className={styles.attendBox}>
                  <div className={styles.card}>출석률(%)
                    <div ref={AverageAttend}  style={{ width: '270px', height: '210px', position: 'relative' }}>
                      {attendanceChartData.series.length > 0 && (
                        // key 항목 넣어줘야 값 바뀌면 재랜더링 됨
                        <Chart
                          ChartType="DonutChart"
                          data={attendanceChartData}
                          options={{
                            ...attendanceChartData.options,
                            chart: {
                              ...attendanceChartData.options.chart,
                              width: averageAttendSize.width,
                              height: averageAttendSize.height,
                            },
                          }}
                          // key={averageAttendSize.width + '-' + averageAttendSize.height}
                          key={attendanceChartData.series.join('-')} // ✅ 값 바뀔 때마다 차트 리렌더링됨
                        /> 
                      )}
                    </div>                 
                  </div>
                </div>
                <div className={styles.attendBox}>
                  <div className={styles.card} style ={{height: '249px'}}>폴짝 참여 현황
                    <div ref={LineChartAttend} style={{width: '410px', height: '210px', position: 'relative' }}>
                      {memberLineChart && memberLineChart.series.length > 0 && (
                        <Chart
                          ChartType="LineChart"
                          data={memberLineChart}
                          options={memberLineChart.options}
                          key={memberLineChart.series.map(s => s.data.join(',')).join('|')}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.averageTop}>
                <div className={styles.topRecordWrap}>
                  <div className={styles.topRecordTitle}>
                    평균 득점 TOP 5
                  </div>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const player = topScorer[i]; // 존재 여부 확인
                    const name = player ? player.UserName : '-';
                    const score = player ? player.Score : '-';

                    return (
                      <div
                        key={i}
                        className={`${styles.playerRow} ${
                          i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow
                        }`}
                      >
                        <div className={styles.rank}>{i + 1}</div>
                        <div className={styles.name}>{name}</div>
                        <div className={styles.score}>{score}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.topRecordWrap}>
                  <div className={styles.topRecordTitle}>
                    평균 어시스트 TOP 5
                  </div>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const player = topAssist[i]; // 존재 여부 확인
                    const name = player ? player.UserName : '-';
                    const assist = player ? player.Assist : '-';

                    return (
                      <div
                        key={i}
                        className={`${styles.playerRow} ${
                          i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow
                        }`}
                      >
                        <div className={styles.rank}>{i + 1}</div>
                        <div className={styles.name}>{name}</div>
                        <div className={styles.score}>{assist}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className={styles.topRecordWrap}>
                  <div className={styles.topRecordTitle}>
                    평균 리바운드 TOP 5
                  </div>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const player = topRebound[i]; // 존재 여부 확인
                    const name = player ? player.UserName : '-';
                    const rebound = player ? player.Rebound : '-';

                    return (
                      <div
                        key={i}
                        className={`${styles.playerRow} ${
                          i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow
                        }`}
                      >
                        <div className={styles.rank}>{i + 1}</div>
                        <div className={styles.name}>{name}</div>
                        <div className={styles.score}>{rebound}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className={styles.topRecordWrap}>
                  <div className={styles.topRecordTitle}>
                    평균 스틸 TOP 5
                  </div>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const player = topSteal[i]; // 존재 여부 확인
                    const name = player ? player.UserName : '-';
                    const steal = player ? player.Steal : '-';
                    return (
                      <div
                        key={i}
                        className={`${styles.playerRow} ${
                          i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow
                        }`}
                      >
                        <div className={styles.rank}>{i + 1}</div>
                        <div className={styles.name}>{name}</div>
                        <div className={styles.score}>{steal}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 중단: 왼쪽(개인 기록 + 차트), 오른쪽(선수/팀 기록 전체 영역) */}
            <div className={styles.middleSummary}>
              <div className={styles.leftCharts}>
                <div className={`${styles.privateRecord} ${styles.card} ${styles.cardShort}`}>
                  <div className={styles.privateRecordHeader}>
                    <span>개인 기록</span>
                    <span className={styles.privateRecordHeaderRight}>{personalWin}W {personalLose}L {personalDraw}D</span> 
                  </div>
                  <div className={styles.privateRecordContents}>
                    <div className={styles.privateRecordContentsDetail}>
                      <div className={styles.privateMainRecord}>
                        {personalScore}
                      </div>
                      <div className={styles.privateRecordContentsTitle}>
                        POINTS
                      </div>
                    </div>
                    <div className={styles.privateRecordContentsDetail}>
                      <div className={styles.privateMainRecord}>
                        {personalAssist}
                      </div>
                      <div className={styles.privateRecordContentsTitle}>
                        ASSISTS
                      </div>
                    </div>
                    <div className={styles.privateRecordContentsDetail}>
                      <div className={styles.privateMainRecord}>
                        {personalRebound}
                      </div>
                      <div className={styles.privateRecordContentsTitle}>
                        REBOUNDS
                      </div>
                    </div>
                    <div className={styles.privateAddRecord}>
                      <div className={styles.privateRecordContentsDetail}>
                        <div className={styles.privateSubRecord}>
                          {personalBlock}
                        </div>
                        <div className={styles.privateRecordContentsSubTitle}>
                          BLOCKS
                        </div>
                      </div>
                      <div className={styles.privateRecordContentsDetail}>
                        <div className={styles.privateSubRecord}>
                          {personalSteal}
                        </div>
                        <div className={styles.privateRecordContentsSubTitle}>
                          STEALS
                        </div>
                      </div>
                      <div className={styles.privateRecordContentsDetail}>
                        <div className={styles.privateSubRecord}>
                          {personalFoul}
                        </div>
                        <div className={styles.privateRecordContentsSubTitle}>
                          FOULS
                        </div>
                      </div>
                      <div className={styles.privateRecordContentsDetail}>
                        <div className={styles.privateSubRecord}>
                          {personalTurnOver}
                        </div>
                        <div className={styles.privateRecordContentsSubTitle}>
                          TURNOVERS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.cardGroupRow}>
                  <div className={styles.card}>개인별 득점/어시스트 추이
                    <div ref={LineChartOffenseStats} style={{width: '340px', height: '180px', position: 'relative' }}>
                      {offenseStatsLineChart && offenseStatsLineChart.series.length > 0 && (
                        <Chart
                          ChartType="LineChart"
                          data={offenseStatsLineChart}
                          options={offenseStatsLineChart.options}
                          key={offenseStatsLineChart.series.map(s => s.data.join(',')).join('|')}
                        />
                      )}
                    </div>
                  </div>
                  <div className={styles.card}>개인별 리바/스틸 추이
                    <div ref={LineChartDefenseStats} style={{width: '340px', height: '180px', position: 'relative' }}>
                      {defenseStatsLineChart && defenseStatsLineChart.series.length > 0 && (
                        <Chart
                          ChartType="LineChart"
                          data={defenseStatsLineChart}
                          options={defenseStatsLineChart.options}
                          key={defenseStatsLineChart.series.map(s => s.data.join(',')).join('|')}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{marginTop : '-4px', height: '100%'}}>
                <DynamicArea>
                  <div style={{height:"100%", width: "100%"}}>
                      <Grid ref={grid1Ref} gridId="DataSet1" title = "선수별 평균 기록" source = {grid1Data} headerOptions={headerOptions} columns = {columns1} onChange={handleGridChange} addRowBtn = {false} onClick={gridClick}/>
                  </div>
                </DynamicArea>
              </div>
            </div>
          </div>
        </div>
    )
}

export default Main;