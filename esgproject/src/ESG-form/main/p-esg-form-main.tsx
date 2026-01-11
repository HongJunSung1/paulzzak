import React, { useMemo, useState, useRef, useEffect } from 'react';
import Chart from '../../ESG-common/Chart/p-pz-common-chart.tsx';
import styles from './p-esg-form-main.module.css';
import Toolbar from '../../ESG-common/Toolbar/p-esg-common-Toolbar.tsx';
import Loading from '../../ESG-common/LoadingBar/p-esg-common-LoadingBar.tsx';
import DynamicArea from '../../ESG-common/DynamicArea/p-esg-common-DynamicArea.tsx';
import Grid from '../../ESG-common/Grid/p-esg-common-grid.tsx';
import { SP_Request } from '../../hooks/sp-request.tsx';
import FixedArea from '../../ESG-common/FixedArea/p-esg-common-FixedArea.tsx';
import FixedWrap from '../../ESG-common/FixedArea/p-esg-common-FixedWrap.tsx';
import SearchBox from '../../ESG-common/SearchBox/p-esg-common-SearchBox.tsx';
import { ApexOptions } from 'apexcharts';
import { useApexAutoResize } from '../../hooks/useApexAutoResize.tsx'; //hook 추가

import '../../global.d.ts';

type gridAr = {
  DataSet: string;
  grid: any[];
};

type condition = {
  SeasonCD: number;
  DataSet: string;
};

type FormMainProps = {
  strOpenUrl: any;
  openTabs: any;
};

type TopScorer = { UserName: string; Score: number };
type TopAssist = { UserName: string; Assist: number };
type TopRebound = { UserName: string; Rebound: number };
type TopSteal = { UserName: string; Steal: number };

const Main = ({ strOpenUrl, openTabs }: FormMainProps) => {
  // 로딩뷰
  const [loading, setLoading] = useState(false);

  // 최초 1회에는 자동 조회 쿼리
  const IsFirstEnter = useRef(true);

  // 조회조건 값
  const [SeasonCD, setSeasonCD] = useState(0);
  const [SeasonName, setSeasonName] = useState(''); // 로그인 시 서치박스 표시용

  // 조회 시 받는 데이터 값
  const [grid1Data, setGrid1Data] = useState<any[]>([]);

  // Grid ref
  const grid1Ref: any = useRef(null);

  const isMain = strOpenUrl === '/main';

  const [viewRev, setViewRev] = useState(0); // main 화면 다시 보일 때마다 +1

  // 화면 다시 들어오면 재랜더링해서 나올 수 있게
  useEffect(() => {
    if (!isMain) return;

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        // Grid 복구
        const inst = grid1Ref.current?.getInstance?.();
        if (inst && rightGridRef.current) {
          const w = Math.floor(rightGridRef.current.getBoundingClientRect().width);
          inst.setWidth?.(w);
          inst.refreshLayout?.();
        }

        // 차트 복구: 리마트 말고 resize만
        try {
          // @ts-ignore
          window.ApexCharts?.exec?.('attendanceDonut', 'resize');
          // @ts-ignore
          window.ApexCharts?.exec?.('memberLine', 'resize');
          // @ts-ignore
          window.ApexCharts?.exec?.('offenseLine', 'resize');
          // @ts-ignore
          window.ApexCharts?.exec?.('defenseLine', 'resize');
        } catch {}

        setViewRev(v => v + 1); // 그리드용은 유지
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
  }, [isMain]);


  // 1. 출석률 도넛차트
  const [attendanceChartData, setAttendanceChartData] = useState<{
    series: number[];
    options: ApexOptions;
  }>({
    series: [],
    options: {
      chart: { type: 'donut' },
    },
  });

  // 2. 회원동향 꺾은선 그래프
  const [memberLineChart, setMemberLineChart] = useState<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>({
    series: [],
    options: {
      chart: { type: 'line' },
    },
  });

  // 3. 개인별 공격 지표 추이
  const [offenseStatsLineChart, setOffenseStatsLineChart] = useState<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>({
    series: [],
    options: {
      chart: { type: 'line' },
    },
  });

  // 4. 개인별 수비 지표 추이
  const [defenseStatsLineChart, setDefenseStatsLineChart] = useState<{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  } | null>({
    series: [],
    options: {
      chart: { type: 'line' },
    },
  });

  // 차트 사이즈 결정짓는 요소들
  const AverageAttend = useRef<HTMLDivElement>(null);
  const LineChartAttend = useRef<HTMLDivElement>(null);
  const LineChartOffenseStats = useRef<HTMLDivElement>(null);
  const LineChartDefenseStats = useRef<HTMLDivElement>(null);

  // const [averageAttendSize, setAverageAttendSize] = useState({ width: 0, height: 0 });
  // const [lineChartAttendSize, setLineChartAttendSize] = useState({ width: 0, height: 0 });
  // const [lineChartOffenseStatsSize, setLineChartOffenseStatsSize] = useState({ width: 0, height: 0 });
  // const [lineChartDefenseStatsSize, setLineChartDefenseStatsSize] = useState({ width: 0, height: 0 });
  // ✅ 훅으로 사이즈 + Apex resize 자동 처리
  const averageAttendSize = useApexAutoResize(AverageAttend as any, 'attendanceDonut', {
    enabled: isMain,
    measure: true,
    debounceMs: 50,  // 드래그 리사이즈 깜빡임 줄이려면 30~80 추천
  });

  const lineChartAttendSize = useApexAutoResize(LineChartAttend as any, 'memberLine', {
    enabled: isMain,
    measure: true,
    debounceMs: 50,
  });

  const lineChartOffenseStatsSize = useApexAutoResize(LineChartOffenseStats as any, 'offenseLine', {
    enabled: isMain,
    measure: true,
    debounceMs: 50,
  });

  const lineChartDefenseStatsSize = useApexAutoResize(LineChartDefenseStats as any, 'defenseLine', {
    enabled: isMain,
    measure: true,
    debounceMs: 50,
  });



  const [donutMountKey, setDonutMountKey] = useState(0);
  const [donutFont, setDonutFont] = useState({ value: 32, name: 12 });
  const [isDonutCompact, setIsDonutCompact] = useState(false);

  const donutCardRef = useRef<HTMLDivElement>(null);
  const rightGridRef = useRef<HTMLDivElement>(null);

  const gridRaf1Ref = useRef<number | null>(null);
  const gridRaf2Ref = useRef<number | null>(null);
  const gridAliveRef = useRef(true);

  useEffect(() => {
    gridAliveRef.current = true;
    return () => {
      gridAliveRef.current = false;
      if (gridRaf1Ref.current) cancelAnimationFrame(gridRaf1Ref.current);
      if (gridRaf2Ref.current) cancelAnimationFrame(gridRaf2Ref.current);
    };
  }, []);

  const safeRefresh = (inst: any) => {
    const el = inst?.el as HTMLElement | undefined;
    if (!el) return false;
    if (!el.isConnected) return false;         // ✅ DOM에서 떨어졌으면 금지
    return true;
  };  


  // 개인기록
  const [personalWin, setPersonalWin] = useState(0);
  const [personalLose, setPersonalLose] = useState(0);
  const [personalDraw, setPersonalDraw] = useState(0);
  const [personalScore, setPersonalScore] = useState(0);
  const [personalAssist, setPersonalAssist] = useState(0);
  const [personalRebound, setPersonalRebound] = useState(0);
  const [personalBlock, setPersonalBlock] = useState(0);
  const [personalSteal, setPersonalSteal] = useState(0);
  const [personalFoul, setPersonalFoul] = useState(0);
  const [personalTurnOver, setPersonalTurnOver] = useState(0);

  // Top5 기록
  const [topScorer, setTopScorer] = useState<TopScorer[]>([]);
  const [topAssist, setTopAssist] = useState<TopAssist[]>([]);
  const [topRebound, setTopRebound] = useState<TopRebound[]>([]);
  const [topSteal, setTopSteal] = useState<TopSteal[]>([]);

  // 시트 사이즈
  const syncGridLayout = () => {
    if (!isMain) return;

    const host = rightGridRef.current;
    const inst = grid1Ref.current?.getInstance?.();
    if (!host || !inst) return;

    // ✅ inst.el 체크 (Toast Grid 내부가 el.querySelector를 바로 씀)
    const root = inst.el as HTMLElement | undefined;
    if (!root) return;
    if (!root.isConnected) return; // ✅ DOM에서 떨어진 뒤 호출 방지

    // ✅ 현재 컨테이너 실제 사이즈
    const rect = host.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    /**
     * ⚠️ 핵심:
     * - 작은 화면에서 시작하면 초기에는 레이아웃 계산이 덜 된 상태로 w/h가 0이거나,
     *   grid가 내부적으로 "고정폭"을 들고 있는 경우가 있습니다.
     * - 이때 바로 return 해버리면 "큰 화면으로 옮겼을 때" 첫 타이밍을 놓치고
     *   그대로 작은 폭이 유지되는 경우가 있어요.
     *
     * 그래서 w/h가 0인 경우에도 "한 번 더" 재시도 스케줄만 걸어둡니다.
     */
    const scheduleRetry = () => {
      if (gridRaf1Ref.current) cancelAnimationFrame(gridRaf1Ref.current);
      if (gridRaf2Ref.current) cancelAnimationFrame(gridRaf2Ref.current);

      gridRaf1Ref.current = requestAnimationFrame(() => {
        gridRaf2Ref.current = requestAnimationFrame(() => {
          // ✅ 재시도 시점에도 안전 체크
          if (!isMain) return;
          const inst2 = grid1Ref.current?.getInstance?.();
          const host2 = rightGridRef.current;
          if (!inst2 || !host2) return;

          const root2 = inst2.el as HTMLElement | undefined;
          if (!root2 || !root2.isConnected) return;

          try {
            inst2.refreshLayout?.();
          } catch {}
        });
      });
    };

    // ✅ 레이아웃 전(0) 상태면 "return" 하지 말고 재시도 예약
    if (w <= 0 || h <= 0) {
      scheduleRetry();
      return;
    }

    /**
     * ===========================
     * ✅ (기존 로직 1) 폭 고착 해제
     * ===========================
     */
    try {
      // ✅ “작게 시작한 폭” 고착 해제 (핵심)
      root.style.width = '';
      root.style.maxWidth = '';

      // tui-grid 내부 컨테이너들도 같이 풀어줌
      const c1 = root.querySelector('.tui-grid-container') as HTMLElement | null;
      const c2 = root.querySelector('.tui-grid-content-area') as HTMLElement | null;
      const c3 = root.querySelector('.tui-grid-header-area') as HTMLElement | null;

      [c1, c2, c3].forEach(el => {
        if (!el) return;
        el.style.width = '';
        el.style.maxWidth = '';
      });
    } catch {
      // root가 살아있어도 내부 구조 타이밍 문제 있을 수 있어서 방어
    }

    /**
     * ===========================
     * ✅ (기존 로직 2) 폭/레이아웃 갱신
     * ===========================
     */
    try {
      inst.setWidth?.(w);
      inst.refreshLayout?.();
    } catch {
      // inst 내부 el이 순간적으로 undefined가 되면 여기서도 터질 수 있어 방어
      return;
    }

    /**
     * ===========================
     * ✅ (기존 로직 3) 2프레임 뒤 한 번 더
     * + 안전 체크 + 취소 처리
     * ===========================
     */
    if (gridRaf1Ref.current) cancelAnimationFrame(gridRaf1Ref.current);
    if (gridRaf2Ref.current) cancelAnimationFrame(gridRaf2Ref.current);

    gridRaf1Ref.current = requestAnimationFrame(() => {
      gridRaf2Ref.current = requestAnimationFrame(() => {
        if (!isMain) return;

        const inst2 = grid1Ref.current?.getInstance?.();
        if (!inst2) return;

        const root2 = inst2.el as HTMLElement | undefined;
        if (!root2 || !root2.isConnected) return;

        // ✅ 마지막 순간에 host 폭이 바뀌었을 수도 있어서 다시 폭 동기화 1회 더
        const host2 = rightGridRef.current;
        if (!host2) return;

        const w2 = Math.floor(host2.getBoundingClientRect().width);
        const h2 = Math.floor(host2.getBoundingClientRect().height);
        if (w2 <= 0 || h2 <= 0) return;

        try {
          inst2.setWidth?.(w2);
          inst2.refreshLayout?.();
        } catch {}
      });
    });
  };


  // ✅ “브레이크포인트 재배치”는 한 번에 안 끝나서 2~3번 더 쏨
  const syncGridLayoutBurst = () => {
    syncGridLayout();
    setTimeout(syncGridLayout, 80);
    setTimeout(syncGridLayout, 200);
  };

  // ✅ 도넛 카드 폭(230px 기준) 감지 → compact 토글
  useEffect(() => {
    if (!isMain) return;
    const el = donutCardRef.current;
    if (!el) return;

    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setIsDonutCompact(prev => {
          const next = w <= 230;
          return prev === next ? prev : next;
        });
      });
    });

    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isMain]);

  // ✅ 도넛: 리사이즈/고착 방지(줄어듦/커짐 모두)
// ✅ 도넛: 사이즈 변화에 맞춰 폰트 계산만 수행 (resize는 useApexAutoResize가 담당)
useEffect(() => {
  if (!isMain) return;

  const host = AverageAttend.current;
  if (!host) return;

  const hostW = Math.round(host.getBoundingClientRect().width);
  const hostH = Math.round(host.getBoundingClientRect().height);
  if (hostW <= 0 || hostH <= 0) return;

  const minSide = Math.min(hostW, hostH);
  const valueFont = Math.max(16, Math.min(36, Math.floor(minSide * 0.18)));
  const nameFont = Math.max(10, Math.min(14, Math.floor(minSide * 0.06)));

  setDonutFont(prev =>
    prev.value === valueFont && prev.name === nameFont ? prev : { value: valueFont, name: nameFont }
  );
}, [isMain, averageAttendSize.width, averageAttendSize.height]);


  // ✅ compact 바뀌면 도넛 옵션 재생성 + remount
  useEffect(() => {
    if (attendanceChartData.series.length <= 0) return;

    setAttendanceChartData(prev => {
      const attend = prev.series[0] ?? 0;
      const absent = prev.series[1] ?? 0;
      return makeAttendanceChart(attend, absent, isDonutCompact);
    });

    setDonutMountKey(k => k + 1);
  }, [isDonutCompact]); // eslint-disable-line react-hooks/exhaustive-deps


  
  // ✅ 오른쪽 그리드 폭 변하면(줄어듦/커짐) 레이아웃 갱신
  useEffect(() => {
    const host = rightGridRef.current;
    if (!host) return;

    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncGridLayout);
    });

    ro.observe(host);
    
    // ✅ 처음 1회도 강제
    requestAnimationFrame(() => requestAnimationFrame(syncGridLayoutBurst));
    
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
      };
  }, []);

  useEffect(() => {
    const onResize = () => syncGridLayoutBurst();
    window.addEventListener('resize', onResize);
    // 모바일이면 이것도 효과 큼
    window.visualViewport?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!isMain) return;
    if (grid1Data.length === 0) return;
    syncGridLayoutBurst();
  }, [isMain, grid1Data.length]);  

  useEffect(() => {
    if (!isMain) return;
    requestAnimationFrame(() => requestAnimationFrame(syncGridLayout));
  }, [isMain, viewRev]);




  // 차트 만들기 -------------------------------------------------------
  const makeAttendanceChart = (attend: number, absent: number, compact: boolean) => {
    // 도넛 호스트 높이에 비례해서 중심 보정값 계산
    const centerFix = Math.max(10, Math.min(0, Math.round((donutFont.value - 28) * 0.25)));
    const centerfontSize = Math.max(donutFont.value )
    return {
      series: [attend, absent],
      options: {
        chart: {
          id: 'attendanceDonut',
          type: 'donut' as const,
          background: 'transparent',
          animations: { enabled: false },
          redrawOnWindowResize: true,
          redrawOnParentResize: true,
          parentHeightOffset: 0,
        },
        grid: { padding: { top: 8, bottom: 8, left: 8, right: 8 } },
        labels: ['출석', '불참'],
        // colors: ['#1e2a78', '#CFCFCF'],
        colors: ['#87010C', '#CFCFCF'],
        legend: { show: false },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (val: number) => `${val}%` } },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: compact ? '68%' : '70%',
              labels: {
                show: !compact,
                name: {
                  show: true,
                  // fontSize: '12px',
                  fontSize: `${donutFont.name}px`,
                  offsetY: -6 + centerFix,
                  fontWeight: 300,
                },
                value: {
                  show: true,
                  // fontSize: '32px',
                  fontSize: `${donutFont.value}px`,
                  fontWeight: 800,
                  offsetY: 6 + centerFix,
                  formatter: (val: string) => `${val}%`,
                },
                total: {
                  show: true,
                  label: '',
                  // fontSize: '12px',
                  fontSize: `${donutFont.name}px`,
                  fontWeight: 600,
                  offsetY: 18 + centerFix,
                  formatter: () => `${attend}%`,
                },
              },
            },
          },
        },
        stroke: { show: false },
      },
    };
  };

  useEffect(() => {
    if (!isMain) return;
    if (attendanceChartData.series.length <= 0) return;

    const attend = attendanceChartData.series[0] ?? 0;
    const absent = attendanceChartData.series[1] ?? 0;

    setAttendanceChartData(makeAttendanceChart(attend, absent, isDonutCompact));
    setDonutMountKey(k => k + 1); // ✅ 확실히 반영되게 remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMain, donutFont.value, donutFont.name, averageAttendSize]); // 필요하면 averageAttendSize도 추가  

  useEffect(() => {
    if (attendanceChartData.series.length <= 0) return;

    setAttendanceChartData(prev => {
      const attend = prev.series[0] ?? 0;
      const absent = prev.series[1] ?? 0;
      return makeAttendanceChart(attend, absent, isDonutCompact);
    });

    setDonutMountKey(k => k + 1);
  }, [donutFont.value, donutFont.name]); // ✅ 폰트 바뀌면 옵션 재생성  

  const makeMemberLineChart = (rawData: any): { series: { name: string; data: number[] }[]; options: ApexOptions } | null => {
    if (!rawData || rawData.length === 0) return null;

    const sorted = [...rawData].sort((a, b) => new Date(b.GameDate).getTime() - new Date(a.GameDate).getTime());
    const sliced = sorted.slice(0, 5);

    return {
      series: [
        { name: '회원 수', data: sliced.map((r: any) => Number(r.TotalCnt)) },
        { name: '참석자 수', data: sliced.map((r: any) => Number(r.AttendCnt)) },
        { name: '불참자 수', data: sliced.map((r: any) => Number(r.AbsentCnt)) },
      ],
      options: {
        chart: {
          id: 'memberLine',
          type: 'line' as const,
          offsetX: 0,
          background: 'transparent',
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: false },
          redrawOnWindowResize: true,
          redrawOnParentResize: true,
          parentHeightOffset: 0,   //  카드/컨테이너 안에서 높이 계산 안정화
        },
        grid: { padding: { left: 10, right: 10, top: 10, bottom: 22 } },
        xaxis: {
          categories: sliced.map((r: any) => r.GameDate),
          tickPlacement: 'between',
              labels: {
                        show: true,
                        rotate: 0,
                        trim: false,
                        hideOverlappingLabels: false,
                        style: { fontSize: '10px', fontWeight: 500 },
                        offsetY: 0,
                      },
        },
        yaxis: { min: 0, labels: { style: { fontSize: '10px' } } },
        stroke: { curve: 'smooth', width: 5 },
        markers: { size: 4, strokeWidth: 0 },
        tooltip: { shared: true, intersect: false },
        colors: ['#4C78A8', '#3E3E3E', '#CFCFCF'],
        legend: { show: false },
      },
    };
  };

  const makeOffenseLineChart = (rawData: any): { series: { name: string; data: number[] }[]; options: ApexOptions } | null => {
    if (!rawData || rawData.length === 0) return null;

    const sorted = [...rawData].sort((a, b) => new Date(b.GameDate).getTime() - new Date(a.GameDate).getTime());
    const sliced = sorted.slice(0, 5).reverse();

    return {
      series: [
        { name: '득점', data: sliced.map((r: any) => Number(r.Score)) },
        { name: '어시스트', data: sliced.map((r: any) => Number(r.Assist)) },
      ],
      options: {
        chart: {
          id: 'offenseLine',
          type: 'line' as const,
          offsetX: 0,
          background: 'transparent',
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: false },
          redrawOnWindowResize: true,
          redrawOnParentResize: true,
          parentHeightOffset: 0,
        },
        grid: { padding: { left: 10, right: 5, top: -10, bottom: 0 } },
        xaxis: {
          categories: sliced.map((r: any) => r.GameDate),
          labels: { rotate: 0, style: { fontSize: '10px', fontWeight: 500 } },
        },
        yaxis: { min: 0, labels: { style: { fontSize: '10px' } } },
        stroke: { curve: 'smooth', width: 5 },
        markers: { size: 4, strokeWidth: 0 },
        tooltip: { shared: true, intersect: false },
        colors: ['#4C78A8', '#3E3E3E'],
        legend: { show: false },
        
      },
    };
  };

  const makeDefenseLineChart = (rawData: any): { series: { name: string; data: number[] }[]; options: ApexOptions } | null => {
    if (!rawData || rawData.length === 0) return null;

    const sorted = [...rawData].sort((a, b) => new Date(b.GameDate).getTime() - new Date(a.GameDate).getTime());
    const sliced = sorted.slice(0, 5).reverse();

    return {
      series: [
        { name: '리바운드', data: sliced.map((r: any) => Number(r.Rebound)) },
        { name: '스틸', data: sliced.map((r: any) => Number(r.Steal)) },
      ],
      options: {
        chart: {
          id: 'defenseLine',
          type: 'line' as const,
          offsetX: 0,
          background: 'transparent',
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: false },
          redrawOnWindowResize: true,
          redrawOnParentResize: true,
          parentHeightOffset: 0,
        },
        grid: { padding: { left: 10, right: 5, top: -10, bottom: 0 } },
        xaxis: {
          categories: sliced.map((r: any) => r.GameDate),
          labels: { rotate: 0, style: { fontSize: '10px', fontWeight: 500 } },
        },
        yaxis: { min: 0, labels: { style: { fontSize: '10px' } } },
        stroke: { curve: 'smooth', width: 5 },
        markers: { size: 4, strokeWidth: 0 },
        tooltip: { shared: true, intersect: false },
        colors: ['#4C78A8', '#3E3E3E'],
        legend: { show: false },
      },
    };
  };

  // ---------------------------------------------------------------------------------------
  // 저장 시 넘기는 컬럼 값
  const [grid1Changes, setGrid1Changes] = useState<gridAr>({ DataSet: '', grid: [] });

  // 저장 시 시트 변화 값 감지
  const handleGridChange = (gridId: string, changes: gridAr) => {
    if (gridId === 'DataSet1') setGrid1Changes(changes);
  };

  // 툴바
  const toolbar = [{ id: 0, title: '조회', image: 'query', spName: '' }];

  // 헤더 정보
  const headerOptions = useMemo(() => {
    const complexColumns: any[] = [];
    return {
      height: 30,
      complexColumns: complexColumns.length > 0 ? complexColumns : undefined,
    };
  }, []);

  // 시트 컬럼 값
  const columns1 = [
    { name: 'UserCD', header: '유저코드', width: 70, hidden: true },
    { name: 'UserName', header: '이름', width: 80, sortable: true },
    { name: 'UserID', header: '유저ID', width: 80, hidden: true },
    { name: 'MatchCnt', header: '경기 수', width: 80, sortable: true },
    { name: 'Score', header: '득점', width: 80, sortable: true },
    { name: 'Assist', header: '어시스트', width: 80, sortable: true },
    { name: 'Rebound', header: '리바운드', width: 80, sortable: true },
    { name: 'Block', header: '블로킹', width: 80, sortable: true },
    { name: 'Steal', header: '스틸', width: 80, sortable: true },
    { name: 'Foul', header: '파울', width: 80, sortable: true },
    { name: 'TurnOver', header: '턴오버', width: 80, sortable: true },
  ];

  const MainQuery = (conditionAr: any) => {
    setTimeout(async () => {
      setLoading(true);
      try {
        const result = await SP_Request('S_PZ_Main_Query', [conditionAr]);

        // 1. 출석률
        if (result[0]?.length > 0) {
          const row = result[0][0];
          const attend = Number(row.AttendRate) ?? 0;
          const absent = Number(row.AbsentRate) ?? 0;
          const loginSeason = Number(row.SeasonCD) ?? 0;
          const loginSeasonName = String(row.SeasonName ?? '');
          if (loginSeason > 0) {
            // 화면에도 최신 시즌 세팅
            setSeasonCD(loginSeason);
            setSeasonName(loginSeasonName);
          }
          setAttendanceChartData(makeAttendanceChart(attend, absent, isDonutCompact));
        }

        // 2. 회원 동향
        if (result[1]?.length > 0) setMemberLineChart(makeMemberLineChart(result[1]));

        // 3. 개인별 추이
        if (result[2]?.length > 0) {
          setOffenseStatsLineChart(makeOffenseLineChart(result[2]));
          setDefenseStatsLineChart(makeDefenseLineChart(result[2]));
        }

        // 4. 개인 기록
        if (result[3]?.length > 0) {
          const r = result[3][0];
          setPersonalWin(r.Win);
          setPersonalLose(r.Lose);
          setPersonalDraw(r.Draw);
          setPersonalScore(r.Score);
          setPersonalAssist(r.Assist);
          setPersonalRebound(r.Rebound);
          setPersonalBlock(r.Block);
          setPersonalSteal(r.Steal);
          setPersonalFoul(r.Foul);
          setPersonalTurnOver(r.TurnOver);
        }

        // 5. grid
        if (result[4]?.length > 0) setGrid1Data(result[4]);
        else setGrid1Data([]);

        // 6~9 Top5
        if (result[5]?.length > 0) setTopScorer(result[5]);
        if (result[6]?.length > 0) setTopAssist(result[6]);
        if (result[7]?.length > 0) setTopRebound(result[7]);
        if (result[8]?.length > 0) setTopSteal(result[8]);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    });
  };

  const toolbarEvent = async (clickID: any) => {
    switch (clickID) {
      case 0: {
        const conditionAr: condition = {
          SeasonCD: SeasonCD,
          DataSet: 'DataSet1',
        };
        MainQuery(conditionAr);
        break;
      }
    }
  };

  // main 최초 진입 1회 자동 조회
  useEffect(() => {
    if (
      strOpenUrl === '/main' &&
      IsFirstEnter.current &&
      averageAttendSize.width > 0 &&
      lineChartAttendSize.width > 0 &&
      lineChartOffenseStatsSize.width > 0 &&
      lineChartDefenseStatsSize.width > 0
    ) {
      const conditionAr: condition = { SeasonCD: -1, DataSet: 'DataSet1' };
      MainQuery(conditionAr);
      IsFirstEnter.current = false;
    }
  }, [
    strOpenUrl,
    averageAttendSize.width,
    lineChartAttendSize.width,
    lineChartOffenseStatsSize.width,
    lineChartDefenseStatsSize.width,
  ]);

  // 시트 클릭시 나머지 시트 포커스 해제
  const gridClick = (ref: any) => {
    // noop
  };

  return (
    <div
      style={{
        top: 0,
        display: strOpenUrl.replace('/', '') === 'main' ? 'flex' : 'none',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Loading loading={loading} />
      <Toolbar items={toolbar} clickID={toolbarEvent} />


      <div className={styles.mainDashboard}>
      <FixedArea name={'조회 조건'}>
        <FixedWrap>
          {/* <SearchBox
            name={'시즌명'}
            value={SeasonCD}
            isRequire={'false'}
            onChange={(val: any) => setSeasonCD(val.code)}
            width={200}
            searchCode={6}
            isGrid={false}
          /> */}
          <SearchBox
            name={'시즌명'}
            value={SeasonCD}
            displayValue={SeasonName}   // ✅ 추가
            isRequire={'false'}
            onChange={(val: any) => {
              // 원상복구 SearchBox 기준: payload 또는 0이 올 수 있음
              if (val === 0) {
                setSeasonCD(0);
                setSeasonName('');
                return;
              }
              setSeasonCD(Number(val.code ?? 0));
              setSeasonName(String(val.display ?? ''));
            }}
            width={200}
            searchCode={6}
            isGrid={false}
          />
        </FixedWrap>
      </FixedArea>
        {/* 최상단: 좌측 요약 + 우측 TOP5 */}
        <div className={styles.topSummary}>
          <div className={styles.topAttend}>
            <div className={styles.attendBox}>
              <div className={`${styles.card} ${styles.attendanceCard}`} style={{ height: '266px' }} ref={donutCardRef}>
                <div className={styles.cardHeader}>출석률(%)</div>

                <div className={styles.donutHost} ref={AverageAttend}>
                  {attendanceChartData.series.length > 0 && (
                    <>
                      <Chart
                        ChartType="DonutChart"
                        data={attendanceChartData}
                        options={attendanceChartData.options}
                        key={`attendanceDonut-${donutMountKey}-${attendanceChartData.series.join('-')}`}
                      />

                      {/* ✅ card width가 230px 이하일 때만 아래 텍스트 */}
                      {isDonutCompact && (
                        <div className={styles.donutBottomValue}>{attendanceChartData.series[0].toFixed(1)}%</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.attendBox}>
              <div className={styles.card} style={{ height: '266px' }}>
                <div className={styles.cardHeader}>폴짝 참여 현황</div>
                <div className={`${styles.chartBox} ${styles.lineChartAttendBox}`} ref={LineChartAttend}>
                  {memberLineChart &&
                    memberLineChart.series.length > 0 &&
                    lineChartAttendSize.width > 0 &&
                    lineChartAttendSize.height > 0 && (
                      <Chart
                        ChartType="LineChart"
                        data={memberLineChart}
                        options={{
                          ...memberLineChart.options,
                          chart: {
                            ...(memberLineChart.options.chart ?? {}),
                            width: lineChartAttendSize.width,
                            height: lineChartAttendSize.height,
                            animations: { enabled: false },   // ✅ 리사이즈 깜빡임/지연 크게 감소
                            redrawOnWindowResize: true,
                            redrawOnParentResize: true,
                            parentHeightOffset: 0,
                          },
                        }}
                        // key={`memberLine-${memberLineMountKey}-${memberLineChart.series
                        //   .map(s => s.data.join(','))
                        //   .join('|')}`}
                        // 리사이징할 때 자꾸 크기가 늘어나기만 하고 줄어들진 않아서 
                        key={`memberLine-${lineChartAttendSize.width}x${lineChartAttendSize.height}-${memberLineChart.series.map(s => s.data.join(',')).join('|')}`}
                      />
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.averageTop}>
            <div className={styles.topRecordWrap}>
              <div className={styles.topRecordTitle}>평균 득점 TOP 5</div>
              {[0, 1, 2, 3, 4].map(i => {
                const p = topScorer[i];
                const name = p ? p.UserName : '-';
                const score = p ? p.Score : '-';
                return (
                  <div
                    key={i}
                    className={`${styles.playerRow} ${i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow}`}
                  >
                    <div className={styles.rank}>{i + 1}</div>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.score}>{score}</div>
                  </div>
                );
              })}
            </div>

            <div className={styles.topRecordWrap}>
              <div className={styles.topRecordTitle}>평균 어시스트 TOP 5</div>
              {[0, 1, 2, 3, 4].map(i => {
                const p = topAssist[i];
                const name = p ? p.UserName : '-';
                const assist = p ? p.Assist : '-';
                return (
                  <div
                    key={i}
                    className={`${styles.playerRow} ${i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow}`}
                  >
                    <div className={styles.rank}>{i + 1}</div>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.score}>{assist}</div>
                  </div>
                );
              })}
            </div>

            <div className={styles.topRecordWrap}>
              <div className={styles.topRecordTitle}>평균 리바운드 TOP 5</div>
              {[0, 1, 2, 3, 4].map(i => {
                const p = topRebound[i];
                const name = p ? p.UserName : '-';
                const rebound = p ? p.Rebound : '-';
                return (
                  <div
                    key={i}
                    className={`${styles.playerRow} ${i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow}`}
                  >
                    <div className={styles.rank}>{i + 1}</div>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.score}>{rebound}</div>
                  </div>
                );
              })}
            </div>

            <div className={styles.topRecordWrap}>
              <div className={styles.topRecordTitle}>평균 스틸 TOP 5</div>
              {[0, 1, 2, 3, 4].map(i => {
                const p = topSteal[i];
                const name = p ? p.UserName : '-';
                const steal = p ? p.Steal : '-';
                return (
                  <div
                    key={i}
                    className={`${styles.playerRow} ${i === 0 ? styles.firstPlayerRow : styles.normalPlayerRow}`}
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

        {/* 중단: 왼쪽(개인 기록 + 차트), 오른쪽(그리드) */}
        <div className={styles.middleSummary}>
          <div className={styles.leftCharts}>
            <div className={`${styles.privateRecord} ${styles.card} ${styles.cardShort}`}>
              <div className={styles.privateRecordHeader}>
                <span>개인 기록</span>
                <span className={styles.privateRecordHeaderRight}>
                  {personalWin}W {personalLose}L {personalDraw}D
                </span>
              </div>

              <div className={styles.privateRecordContents}>
                <div className={styles.privateRecordContentsDetail}>
                  <div className={styles.privateMainRecord}>{personalScore}</div>
                  <div className={styles.privateRecordContentsTitle}>POINTS</div>
                </div>
                <div className={styles.privateRecordContentsDetail}>
                  <div className={styles.privateMainRecord}>{personalAssist}</div>
                  <div className={styles.privateRecordContentsTitle}>ASSISTS</div>
                </div>
                <div className={styles.privateRecordContentsDetail}>
                  <div className={styles.privateMainRecord}>{personalRebound}</div>
                  <div className={styles.privateRecordContentsTitle}>REBOUNDS</div>
                </div>

                <div className={styles.privateAddRecord}>
                  <div className={styles.privateRecordContentsDetail}>
                    <div className={styles.privateSubRecord}>{personalBlock}</div>
                    <div className={styles.privateRecordContentsSubTitle}>BLOCKS</div>
                  </div>
                  <div className={styles.privateRecordContentsDetail}>
                    <div className={styles.privateSubRecord}>{personalSteal}</div>
                    <div className={styles.privateRecordContentsSubTitle}>STEALS</div>
                  </div>
                  <div className={styles.privateRecordContentsDetail}>
                    <div className={styles.privateSubRecord}>{personalFoul}</div>
                    <div className={styles.privateRecordContentsSubTitle}>FOULS</div>
                  </div>
                  <div className={styles.privateRecordContentsDetail}>
                    <div className={styles.privateSubRecord}>{personalTurnOver}</div>
                    <div className={styles.privateRecordContentsSubTitle}>TURNOVERS</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cardGroupRow}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>개인별 득점/어시스트 추이</div>
                <div className={`${styles.chartBox} ${styles.chartBoxSm}`} ref={LineChartOffenseStats}>
                  {offenseStatsLineChart &&
                    offenseStatsLineChart.series.length > 0 &&
                    lineChartOffenseStatsSize.width > 0 &&
                    lineChartOffenseStatsSize.height > 0 && (
                      <Chart
                        ChartType="LineChart"
                        data={offenseStatsLineChart}
                        options={{
                          ...offenseStatsLineChart.options,
                          grid: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
                          chart: {
                            ...(offenseStatsLineChart.options.chart ?? {}),
                            width: lineChartOffenseStatsSize.width,
                            height: lineChartOffenseStatsSize.height,
                          },
                        }}
                        key={`offenseLine-${offenseStatsLineChart.series.map(s => s.data.join(',')).join('|')}`}
                        // key={`offenseLine-${offenseMountKey}-${offenseStatsLineChart.series
                        //   .map(s => s.data.join(','))
                        //   .join('|')}`}
                      />
                    )}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>개인별 리바/스틸 추이</div>
                <div className={`${styles.chartBox} ${styles.chartBoxSm}`} ref={LineChartDefenseStats}>
                  {defenseStatsLineChart &&
                    defenseStatsLineChart.series.length > 0 &&
                    lineChartDefenseStatsSize.width > 0 &&
                    lineChartDefenseStatsSize.height > 0 && (
                      <Chart
                        ChartType="LineChart"
                        data={defenseStatsLineChart}
                        options={{
                          ...defenseStatsLineChart.options,
                          grid: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
                          chart: {
                            ...(defenseStatsLineChart.options.chart ?? {}),
                            width: lineChartDefenseStatsSize.width,
                            height: lineChartDefenseStatsSize.height,
                          },
                        }}
                        key={`defenseLine-${defenseStatsLineChart.series.map(s => s.data.join(',')).join('|')}`}
                        // key={`defenseLine-${defenseMountKey}-${defenseStatsLineChart.series
                        //   .map(s => s.data.join(','))
                        //   .join('|')}`}
                      />
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightGrid} ref={rightGridRef}>
            <DynamicArea>
              <Grid
                key={`main-grid-${viewRev}`} // 화면 들어올 때 재랜더링할 수 있도록
                ref={grid1Ref}
                gridId="DataSet1"
                title="선수별 평균 기록"
                source={grid1Data}
                headerOptions={headerOptions}
                columns={columns1}
                onChange={handleGridChange}
                addRowBtn={false}
                onClick={gridClick}
              />
            </DynamicArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
