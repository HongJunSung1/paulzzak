import React,{useState, useRef, useEffect} from 'react'
import Chart from '../../ESG-common/Chart/p-esg-common-chart.tsx';
import styles from './p-esg-form-main.module.css';
import '../../global.d.ts';

const Main = ({strOpenUrl}) => {
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const leftTopChart1Ref = useRef<HTMLDivElement>(null);
  const leftTopChart2Ref = useRef<HTMLDivElement>(null);
  const rightBottomRef = useRef<HTMLDivElement>(null);

  const [leftBottomSize, setLeftBottomSize] = useState({ width: 0, height: 0 });
  const [leftTopChart1Size, setLeftTopChart1Size] = useState({ width: 0, height: 0 });
  const [rightBottomSize, setRightBottomSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSizes = () => {
      if (leftBottomRef.current) {
        setLeftBottomSize({
          width: leftBottomRef.current.offsetWidth,
          height: leftBottomRef.current.offsetHeight,
        });
      }
      if (leftTopChart1Ref.current) {
        setLeftTopChart1Size({
          width: leftTopChart1Ref.current.offsetWidth,
          height: leftTopChart1Ref.current.offsetHeight,
        });
      }
      if (rightBottomRef.current) {
        setRightBottomSize({
          width: rightBottomRef.current.offsetWidth,
          height: rightBottomRef.current.offsetHeight,
        });
      }
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

    const GaugeData1 = {
      series: [
        {
          name: 'Scope1',
          data: [87],
        },
      ],
    };

    const GaugeData2 = {
      series: [
        {
          name: 'Scope2',
          data: [64],
        },
      ],
    };

    const GaugeOptions = {
      chart: {title:"Scope", width: leftTopChart1Size.width, height: leftTopChart1Size.height },
      series: {
        solid: true,
        dataLabels: { visible: true, offsetY: -30, formatter: (value) => `${value}%` },
      },
      theme: {
        circularAxis: {
          lineWidth: 0,
          strokeStyle: 'rgba(0, 0, 0, 0)',
          tick: {
            lineWidth: 0,
            strokeStyle: 'rgba(0, 0, 0, 0)',
          },
          label: {
            color: 'rgba(0, 0, 0, 0)',
          },
        },
        series: {
          dataLabels: {
            fontSize: 40,
            fontFamily: 'Impact',
            fontWeight: 600,
            color: '#00a9ff',
            textBubble: {
              visible: false,
            },
          },
        },
      },
    };

    const AreaData = {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      series: [
        {
          name: 'Seoul',
          data: [20, 40, 25, 50, 15, 45, 33, 34, 20, 30, 22, 13],
        },
        {
          name: 'Sydney',
          data: [5, 30, 21, 18, 59, 50, 28, 33, 7, 20, 10, 30],
        },
        {
          name: 'Moscow',
          data: [30, 5, 18, 21, 33, 41, 29, 15, 30, 10, 33, 5],
        },
      ],
    };

    const AreaOptions = {
      chart: { title: 'Average Temperature', width: rightBottomSize.width, height: rightBottomSize.height },
      xAxis: { pointOnColumn: false, title: { text: 'Month' } },
      yAxis: { title: 'Temperature (Celsius)' },
      series: { spline: true },
    };

    const BarData = {
      categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        {
          name: 'Budget',
          data: [5000, 3000, 5000, 7000, 6000, 4000, 1000],
        },
        {
          name: 'Income',
          data: [8000, 4000, 7000, 2000, 6000, 3000, 5000],
        },
      ],
    };

    const BarOptions = {
      chart: { title: 'Monthly Revenue', width: leftBottomSize.width, height: leftBottomSize.height },
    };

    return(
        <div style={{ top: 0 ,height:"100%", display : strOpenUrl === '/main' ? "flex" : "none", flexDirection:"column"}}>
          뭐 넣을지 고민 중
        </div>
    )
}

export default Main;