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

  // 조회 시 받는 데이터 값
  const [grid1Data, setGrid1Data] = useState<any[]>([]);

  // Grid ref
  const grid1Ref: any = useRef(null);

  const isMain = strOpenUrl === '/main';

  const [viewRev, setViewRev] = useState(0); // main 화면 다시 보일 때마다 +1

  // 화면 다시 들어오면 재랜더링해서 나올 수 있게
  useEffect(() => {
    if (!isMain) return;

    // main이 다시 보여지는 타이밍에 2프레임 뒤 레이아웃 복구
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        // ✅ Grid 복구
        const inst = grid1Ref.current?.getInstance?.();
        if (inst && rightGridRef.current) {
          const w = Math.floor(rightGridRef.current.getBoundingClientRect().width);
          inst.setWidth?.(w);
          inst.refreshLayout?.();
        }

        // ✅ ApexCharts 복구
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

        // ✅ 최후의 수단: remount (차트/그리드 다시 그리게)
        setDonutMountKey(k => k + 1);
        setMemberLineMountKey(k => k + 1);
        setOffenseMountKey(k => k + 1);
        setDefenseMountKey(k => k + 1);
        setViewRev(v => v + 1);
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

  const [averageAttendSize, setAverageAttendSize] = useState({ width: 0, height: 0 });
  const [lineChartAttendSize, setLineChartAttendSize] = useState({ width: 0, height: 0 });
  const [lineChartOffenseStatsSize, setLineChartOffenseStatsSize] = useState({ width: 0, height: 0 });
  const [lineChartDefenseStatsSize, setLineChartDefenseStatsSize] = useState({ width: 0, height: 0 });

  const [donutMountKey, setDonutMountKey] = useState(0);
  const donutLastAppliedWidthRef = useRef<number>(0);
  const [donutFont, setDonutFont] = useState({ value: 32, name: 12 });
  const [isDonutCompact, setIsDonutCompact] = useState(false);

  const donutCardRef = useRef<HTMLDivElement>(null);
  const rightGridRef = useRef<HTMLDivElement>(null);

  const [memberLineMountKey, setMemberLineMountKey] = useState(0);
  const lastAppliedWidthRef = useRef<number>(0);

  // ✅ offense
  const [offenseMountKey, setOffenseMountKey] = useState(0);
  const offenseLastAppliedWidthRef = useRef<number>(0);

  // ✅ defense
  const [defenseMountKey, setDefenseMountKey] = useState(0);
  const defenseLastAppliedWidthRef = useRef<number>(0);

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

  // AverageAttend 사이즈 감지
  useEffect(() => {
    if (!AverageAttend.current) return;

    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(width);
        const h = Math.round(height);
        setAverageAttendSize(prev => {
          if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) return prev;
          return { width: w, height: h };
        });
      });
    });

    ro.observe(AverageAttend.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

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
  useEffect(() => {
    if (!isMain) return;

    let t: any;

    const fixDonut = () => {
      const host = AverageAttend.current;
      if (!host) return;

      const hostW = Math.round(host.getBoundingClientRect().width);
      const hostH = Math.round(host.getBoundingClientRect().height);
      if (hostW <= 0) return;

      const minSide = Math.min(hostW, hostH);
      const valueFont = Math.max(16, Math.min(36, Math.floor(minSide * 0.18)));
      const nameFont = Math.max(10, Math.min(14, Math.floor(minSide * 0.06)));

      setDonutFont(prev => (prev.value === valueFont && prev.name === nameFont ? prev : { value: valueFont, name: nameFont }));

      if (Math.abs(hostW - donutLastAppliedWidthRef.current) < 2) return;
      donutLastAppliedWidthRef.current = hostW;

      // @ts-ignore
      try {
        // @ts-ignore
        window.ApexCharts?.exec?.('attendanceDonut', 'resize');
      } catch {}

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const canvas = host.querySelector('.apexcharts-canvas') as HTMLElement | null;
          if (!canvas) return;

          const canvasW = Math.round(canvas.getBoundingClientRect().width);
          if (Math.abs(canvasW - hostW) > 4) setDonutMountKey(k => k + 1);
        });
      });
    };

    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(fixDonut));
      }, 200);
    };

    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => requestAnimationFrame(fixDonut));

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [isMain]);

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
      raf = requestAnimationFrame(() => {
        const inst = grid1Ref.current?.getInstance?.();
        if (!inst) return;
        const w = Math.floor(host.getBoundingClientRect().width);
        inst.setWidth?.(w);
        inst.refreshLayout?.();
      });
    });

    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // 폴짝 참여현황 라인차트 리사이즈 트리거
  useEffect(() => {
    if (lineChartAttendSize.width <= 0 || lineChartAttendSize.height <= 0) return;
    try {
      // @ts-ignore
      window.ApexCharts?.exec?.('memberLine', 'resize');
    } catch {}
  }, [lineChartAttendSize.width, lineChartAttendSize.height]);

  useEffect(() => {
    if (!isMain) return;

    let t: any;

    const fixMemberLine = () => {
      const host = LineChartAttend.current;
      if (!host) return;

      const hostW = Math.round(host.getBoundingClientRect().width);
      if (hostW <= 0) return;

      if (Math.abs(hostW - lastAppliedWidthRef.current) < 2) return;
      lastAppliedWidthRef.current = hostW;

      try {
        // @ts-ignore
        window.ApexCharts?.exec?.('memberLine', 'resize');
      } catch {}

      requestAnimationFrame(() => {
        const canvas = host.querySelector('.apexcharts-canvas') as HTMLElement | null;
        if (!canvas) return;

        const canvasW = Math.round(canvas.getBoundingClientRect().width);
        if (canvasW > hostW + 4) setMemberLineMountKey(k => k + 1);
      });
    };

    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(fixMemberLine));
      }, 200);
    };

    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => requestAnimationFrame(fixMemberLine));

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [isMain]);

  useEffect(() => {
    if (!isMain) return;
    let t: any;

    const fixOffense = () => {
      const host = LineChartOffenseStats.current;
      if (!host) return;

      const hostW = Math.round(host.getBoundingClientRect().width);
      if (hostW <= 0) return;

      if (Math.abs(hostW - offenseLastAppliedWidthRef.current) < 2) return;
      offenseLastAppliedWidthRef.current = hostW;

      try {
        // @ts-ignore
        window.ApexCharts?.exec?.('offenseLine', 'resize');
      } catch {}

      requestAnimationFrame(() => {
        const canvas = host.querySelector('.apexcharts-canvas') as HTMLElement | null;
        if (!canvas) return;

        const canvasW = Math.round(canvas.getBoundingClientRect().width);
        if (canvasW > hostW + 4) setOffenseMountKey(k => k + 1);
      });
    };

    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(fixOffense));
      }, 200);
    };

    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => requestAnimationFrame(fixOffense));

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [isMain]);

  useEffect(() => {
    if (!isMain) return;
    let t: any;

    const fixDefense = () => {
      const host = LineChartDefenseStats.current;
      if (!host) return;

      const hostW = Math.round(host.getBoundingClientRect().width);
      if (hostW <= 0) return;

      if (Math.abs(hostW - defenseLastAppliedWidthRef.current) < 2) return;
      defenseLastAppliedWidthRef.current = hostW;

      try {
        // @ts-ignore
        window.ApexCharts?.exec?.('defenseLine', 'resize');
      } catch {}

      requestAnimationFrame(() => {
        const canvas = host.querySelector('.apexcharts-canvas') as HTMLElement | null;
        if (!canvas) return;

        const canvasW = Math.round(canvas.getBoundingClientRect().width);
        if (canvasW > hostW + 4) setDefenseMountKey(k => k + 1);
      });
    };

    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(fixDefense));
      }, 200);
    };

    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => requestAnimationFrame(fixDefense));

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [isMain]);

  useEffect(() => {
    if (!LineChartAttend.current) return;

    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(width);
        const h = Math.round(height);
        setLineChartAttendSize(prev => {
          if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) return prev;
          return { width: w, height: h };
        });
      });
    });

    ro.observe(LineChartAttend.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!LineChartOffenseStats.current) return;

    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(width);
        const h = Math.round(height);
        setLineChartOffenseStatsSize(prev => {
          if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) return prev;
          return { width: w, height: h };
        });
      });
    });

    ro.observe(LineChartOffenseStats.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!LineChartDefenseStats.current) return;

    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(width);
        const h = Math.round(height);
        setLineChartDefenseStatsSize(prev => {
          if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) return prev;
          return { width: w, height: h };
        });
      });
    });

    ro.observe(LineChartDefenseStats.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // 차트 만들기 -------------------------------------------------------
  const makeAttendanceChart = (attend: number, absent: number, compact: boolean) => {
    return {
      series: [attend, absent],
      options: {
        chart: {
          id: 'attendanceDonut',
          type: 'donut' as const,
          background: 'transparent',
        },
        grid: { padding: { top: 8, bottom: 8, left: 8, right: 8 } },
        labels: ['출석', '불참'],
        colors: ['#1e2a78', '#CFCFCF'],
        legend: { show: false },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (val: number) => `${val}%` } },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '72%',
              labels: {
                show: !compact,
                name: {
                  show: true,
                  fontSize: '12px',
                  offsetY: -6,
                  fontWeight: 300,
                },
                value: {
                  show: true,
                  fontSize: '32px',
                  fontWeight: 800,
                  offsetY: 6,
                  formatter: (val: string) => `${val}%`,
                },
                total: {
                  show: true,
                  label: '',
                  fontSize: '12px',
                  fontWeight: 600,
                  offsetY: 18,
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
      const conditionAr: condition = { SeasonCD: 0, DataSet: 'DataSet1' };
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

      <FixedArea name={'조회 조건'}>
        <FixedWrap>
          <SearchBox
            name={'시즌명'}
            value={SeasonCD}
            isRequire={'false'}
            onChange={(val: any) => setSeasonCD(val.code)}
            width={200}
            searchCode={6}
            isGrid={false}
          />
        </FixedWrap>
      </FixedArea>

      <div className={styles.mainDashboard}>
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
                폴짝 참여 현황
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
                          },
                        }}
                        key={`memberLine-${memberLineMountKey}-${memberLineChart.series
                          .map(s => s.data.join(','))
                          .join('|')}`}
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
                        key={`offenseLine-${offenseMountKey}-${offenseStatsLineChart.series
                          .map(s => s.data.join(','))
                          .join('|')}`}
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
                        key={`defenseLine-${defenseMountKey}-${defenseStatsLineChart.series
                          .map(s => s.data.join(','))
                          .join('|')}`}
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
