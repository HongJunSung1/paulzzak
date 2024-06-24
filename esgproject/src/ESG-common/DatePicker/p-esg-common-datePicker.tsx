//Scope 1 - 2
import React,{useState, useRef, useEffect,useCallback} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './p-esg-common-datePicker.module.css';
import {ko} from 'date-fns/locale/ko';


const DatePick = (settings : any) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<any>(null);

    const parseDateValue = useCallback((value) => {
        if (!value) return null;

        let dateValue : Date;

        if (settings.type === 'year') {
            dateValue = new Date(value, 0); // 1월 1일
        } else if (settings.type === 'month') {
            const year = Math.floor(value / 100);
            const month = value % 100 - 1; // 0부터 시작

            dateValue = new Date(year, month);
        } else {
            const year = Math.floor(value / 10000);
            const month = Math.floor((value % 10000) / 100) - 1;
            const day = value % 100;

            dateValue = new Date(year, month, day);
        }

        return isNaN(dateValue.getTime()) ? null : dateValue;
    }, [settings.type]);


    useEffect(() => {
        const dateValue = parseDateValue(settings.value);
        setSelectedDate(dateValue);
    }, [settings.value,parseDateValue]);

    const changeDate = (date) => {

        setSelectedDate(date);

        if (settings.onChange && date !== null) {
            if(settings.type === 'year'){
                settings.onChange(date.getFullYear());
            }else if(settings.type === 'month'){
                const monthData = date.getFullYear().toString() + (((date.getMonth() + 1).toString().length === 1) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString());
                settings.onChange(monthData);
            }else{
                const dateData = date.getFullYear().toString() + ((date.getMonth().toString().length === 1) ? "0" + (date.getMonth() + 1).toString()  : (date.getMonth() + 1).toString() )
                                    + (date.getDate().toString().length === 1 ? "0" + date.getDate().toString() : date.getDate().toString());
                settings.onChange(dateData);
            }
        }
    };

    const RemoveDate = () => {
        
        setSelectedDate(null);

        if (settings.onChange) {
            settings.onChange('');
        }
    };

    // 캘린더 이미지 눌렀을 때 캘린더 열기
    const dateOpen = () => {
        if(datePickerRef.current){
            datePickerRef.current.setOpen(true);
        }
    }
    

    if(settings.type === 'year'){
        return (
            <div className={styles.Wrap} style={{margin: settings.isGrid ? "0 5px" : "3px 5px"}}>
                {settings.name && <div className={styles.DatePickTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : ''}</div>}
                <div className={styles.DatePickerWrap}>
                    <DatePicker
                        ref={datePickerRef}
                        className={settings.isGrid ? styles.DatePickerGrid : styles.DatePicker}
                        dateFormat='yyyy' // 날짜 형태
                        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                        showYearPicker // 연도 선택
                        locale={ko} // 한글
                        minDate={new Date('2000-01-01')} // minDate 이전 날짜 선택 불가
                        maxDate={new Date('2999-12-31')} // maxDate 이후 날짜 선택 불가
                        selected={selectedDate}
                        onChange={(date) =>changeDate(date)}
                        popperPlacement='bottom-start'
                        yearItemNumber={8}
                        calendarClassName={styles.calenderWrapper}
                    />
                    <div className={styles.calendarImgWrap} onClick={dateOpen}>
                        <div className={settings.isGrid ? styles.calendarImgGrid : styles.calendarImg}/>
                    </div>
                    {settings.isGrid === false && 
                    <div className={styles.xBtnWrap}>
                        <button className={styles.BtnClear} onClick={RemoveDate} style={{display: selectedDate ? "inline-block" : "none"}}></button>
                    </div>}
                </div>
            </div>
        )
    }else if(settings.type === 'month'){
        return (
            <div className={styles.Wrap}>
                {settings.name && <div className={styles.DatePickTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : 'Default'}</div>}
                <div className={styles.DatePickerWrap}>
                    <DatePicker
                        ref={datePickerRef}
                        className={settings.isGrid ? styles.DatePickerGrid : styles.DatePicker}
                        dateFormat='yyyy-MM' // 날짜 형태
                        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                        showMonthYearPicker // 월 선택
                        locale={ko}
                        minDate={new Date('2000-01')} // minDate 이전 날짜 선택 불가
                        maxDate={new Date('2999-12')} // maxDate 이후 날짜 선택 불가
                        selected={selectedDate}
                        onChange={(date) =>changeDate(date)}
                        popperPlacement='bottom-start'
                        // calendarClassName={styles.calenderWrapper}
                    />
                    <div className={styles.calendarImgWrap} onClick={dateOpen}>
                        <div className={styles.calendarImg}/>
                    </div>
                    {settings.isGrid === false && 
                    <div className={styles.xBtnWrap}>
                        <button className={styles.BtnClear} onClick={RemoveDate} style={{display: selectedDate ? "inline-block" : "none"}}></button>
                    </div>    
                    }
                </div>
            </div>
        )
    }else{
        return (
            <div className={styles.Wrap}>
                {settings.name && <div className={styles.DatePickTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : 'Default'}</div>}
                <div className={styles.DatePickerWrap}>
                    <DatePicker
                        ref={datePickerRef}
                        className={settings.isGrid ? styles.DatePickerGrid : styles.DatePicker}
                        dateFormat='yyyy-MM-dd' // 날짜 형태
                        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                        showYearDropdown // 연도 선택
                        locale={ko}
                        minDate={new Date('2000-01-01')} // minDate 이전 날짜 선택 불가
                        maxDate={new Date('2999-12-31')} // maxDate 이후 날짜 선택 불가
                        selected={selectedDate}
                        onChange={(date) =>changeDate(date)}
                        popperPlacement='bottom-start'
                        // calendarClassName={styles.calenderWrapper}
                    />
                    <div className={styles.calendarImgWrap} onClick={dateOpen}>
                        <div className={styles.calendarImg}/>
                    </div>
                    {settings.isGrid === false && 
                    <div className={styles.xBtnWrap}> 
                        <button className={styles.BtnClear} onClick={RemoveDate} style={{display: selectedDate ? "inline-block" : "none"}}></button>
                    </div>    
                    }
                </div>
            </div>
        )
    }
};

export default DatePick;