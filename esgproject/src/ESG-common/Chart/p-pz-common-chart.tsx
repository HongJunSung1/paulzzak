import React, { useEffect, useRef, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import styles from './p-pz-common-chart.module.css';

const Chart = ({ ChartType, data, options }) => {
  const chartType = ChartType.toLowerCase().replace('chart', ''); // eg. "donut"

  // 공통 옵션 병합 (배경 투명)
  const mergedOptions = {
    ...options,
    chart: {
      background: 'transparent',
      ...options.chart,
      type: chartType, // eg. BarChart -> bar
    },
  };

  // 차트 선택
  switch (ChartType) {
    case 'BarChart': // 수평 막대 차트
    case 'ColumnChart': // 수직 막대 차트
    case 'LineChart': // 선형 차트
    case 'AreaChart': // 면적 차트
    case 'RadarChart': // 레이더 차트
    case 'PieChart': // 파이 차트
    case 'DonutChart': // 도넛 차트
    case 'RadialBarChart': // 방사형 바 차트
    case 'ScatterChart': // 산점도 차트
    case 'BubbleChart': // 버블 차트
    case 'HeatmapChart': // 히트맵 차트
    case 'PolarAreaChart': // 극좌표 영역 차트
      return (
        <div className={styles.chartWrap}>
          <ReactApexChart
            type={chartType}
            options={mergedOptions}
            series={data.series}
            height={mergedOptions.chart.height || '100%'}
            width={mergedOptions.chart.width || '100%'}
          />
        </div>
      );

    default:
      return <div>지원하지 않는 차트 유형입니다: {ChartType}</div>;
  }
};

export default Chart;