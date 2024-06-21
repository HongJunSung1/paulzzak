import React,{useState, useRef, forwardRef} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './p-esg-common-datePicker.module.css';
import {ko} from 'date-fns/locale/ko';

const DatePick = (settings : any) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<any>(null);

    const changeDate = (date) => {

        setSelectedDate(date);

        if (settings.onChange) {
            if(settings.type === 'year'){
                settings.onChange(date.getFullYear());
            }else if(settings.type === 'month'){
                const monthData = date.getFullYear().toString() + (((date.getMonth() + 1).toString().length === 1) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString());
                settings.onChange(monthData);
            }else{
                const dateData = date.getFullYear().toString() + ((date.getMonth().toString().length === 1) ? "0" + date.getMonth().toString() : date.getMonth().toString())
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


    

    if(settings.type === 'year'){
        return (
            <div className={styles.Wrap}>
                {settings.name && <div className={styles.DatePickTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : ''}</div>}
                <div className={styles.DatePickerWrap}>
                    <DatePicker
                        ref={datePickerRef}
                        className={styles.DatePicker}
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
                    <button className={styles.BtnClear} onClick={RemoveDate} style={{display: selectedDate ? "inline-block" : "none"}}></button>
                </div>
            </div>
        )
    }else if(settings.type === 'month'){
        return (
            <div className={styles.Wrap}>
                <div className={styles.DatePickTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : 'Default'}</div>
                <div className={styles.DatePickerWrap}>
                    <DatePicker
                        ref={datePickerRef}
                        className={styles.DatePicker}
                        dateFormat='yyyy-MM' // 날짜 형태
                        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                        showMonthYearPicker // 월 선택
                        locale={ko}
                        minDate={new Date('2000-01')} // minDate 이전 날짜 선택 불가
                        maxDate={new Date('2999-12')} // maxDate 이후 날짜 선택 불가
                        selected={selectedDate}
                        onChange={(date) =>changeDate(date)}
                        calendarClassName="calendarClass"
                        popperPlacement='bottom-start'
                    />
                    <button className={styles.BtnClear} onClick={RemoveDate} style={{display: selectedDate ? "inline-block" : "none"}}></button>
                </div>
            </div>
        )
    }else{
        return (
            <div className={styles.Wrap}>
                <div className={styles.DatePickTitle} style={{color: settings.isRequire? "red" : "rgb(144, 144, 144)"}}>{settings.name? settings.name : 'Default'}</div>
                <div className={styles.DatePickerWrap}>
                    <DatePicker
                        ref={datePickerRef}
                        className={styles.DatePicker}
                        dateFormat='yyyy-MM-dd' // 날짜 형태
                        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                        showYearDropdown // 연도 선택
                        locale={ko}
                        minDate={new Date('2000-01-01')} // minDate 이전 날짜 선택 불가
                        maxDate={new Date('2999-12-31')} // maxDate 이후 날짜 선택 불가
                        selected={selectedDate}
                        onChange={(date) =>changeDate(date)}
                        calendarClassName="calendarClass"
                        popperPlacement='bottom-start'                        
                    />
                    <button className={styles.BtnClear} onClick={RemoveDate} style={{display: selectedDate ? "inline-block" : "none"}}></button>
                </div>
            </div>
        )
    }
};

export default DatePick;