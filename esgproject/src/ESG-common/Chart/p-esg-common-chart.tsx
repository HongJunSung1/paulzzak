import React, { useRef, useEffect, useState} from 'react';
import '@toast-ui/chart/dist/toastui-chart.min.css';
import styles from './p-esg-common-chart.module.css'

import { BarChart, AreaChart, LineChart, LineAreaChart, ColumnChart, ColumnLineChart, BulletChart, BubbleChart, RadarChart, PieChart, RadialBarChart, GaugeChart} from '@toast-ui/react-chart';

const ChartComp = (settings : any) => {
    
    const chartRef = useRef<any>(null);
    const [isShow,setIsShow] = useState(false);


    useEffect(()=>{
        setIsShow(false);
        if(settings.options.chart.width > 0 && settings.options.chart.height > 0){
            setTimeout(()=>{
                setIsShow(true);
            },100)
        }
    },[settings.options])


    if(settings.ChartType === "BarChart" ){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <BarChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "AreaChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <AreaChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "LineChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <LineChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "LineAreaChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <LineAreaChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "ColumnChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <ColumnChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "ColumnLineChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <ColumnLineChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "BulletChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <BulletChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "BubbleChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <BubbleChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "RadarChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <RadarChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "PieChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <PieChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "RadialBarChart"){
        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <RadialBarChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else if (settings.ChartType === "GaugeChart"){

        return (
            <div className={styles.ChartWrap} style={{width: isShow ? settings.options.chart.width : 0 , height: isShow ? settings.options.chart.height : 0, overflow:'hidden'}}>
                {isShow && <GaugeChart ref={chartRef} data={settings.data} options={settings.options}/>}
            </div>
        )
    }else{
        return(
            <></>
        )
    }
    
}

export default ChartComp;