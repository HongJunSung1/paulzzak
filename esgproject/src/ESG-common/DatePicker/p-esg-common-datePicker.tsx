import React, { useState, useRef, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './p-esg-common-datePicker.module.css';
import { ko } from 'date-fns/locale/ko';

const PORTAL_FORM = 'datepicker-portal-form'; // ✅ 조회조건(폼)
const PORTAL_GRID = 'datepicker-portal-grid'; // ✅ 시트(그리드)

const DatePick = (settings: any) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const datePickerRef = useRef<any>(null);

  // ✅ 인스턴스 구분용 id (다른 DatePicker 열리면 내가 닫히게)
  const myIdRef = useRef<string>(
    `${Date.now()}_${Math.random().toString(16).slice(2)}`
  );
  // ✅ portal root 2개를 body에 1번만 생성
  useEffect(() => {
    const ensurePortal = (id: string) => {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
      }
    };
    ensurePortal(PORTAL_FORM);
    ensurePortal(PORTAL_GRID);
  }, []);
  // ✅ "다른 datepicker가 열렸다" 이벤트 오면 내꺼 닫기
  useEffect(() => {
    const onOpen = (e: any) => {
      const openedId = e?.detail?.id;
      if (!openedId) return;
      if (openedId !== myIdRef.current) {
        datePickerRef.current?.setOpen?.(false);
      }
    };
    window.addEventListener('datepicker:open', onOpen as any);
    return () => window.removeEventListener('datepicker:open', onOpen as any);
  }, []);
  const notifyOpen = () => {
    window.dispatchEvent(
      new CustomEvent('datepicker:open', { detail: { id: myIdRef.current } })
    );
  };

  const parseDateValue = useCallback((value: any) => {
    if (!value) return null;

    let dateValue: Date;

    if (settings.type === 'year') {
      dateValue = new Date(value, 0);
    } else if (settings.type === 'month') {
      const year = Math.floor(value / 100);
      const month = (value % 100) - 1;
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
    setSelectedDate(parseDateValue(settings.value));
  }, [settings.value, parseDateValue]);

  const changeDate = (date: any) => {
    setSelectedDate(date);

    if (settings.onChange && date !== null) {
      if (settings.type === 'year') {
        settings.onChange(date.getFullYear());
      } else if (settings.type === 'month') {
        const monthData =
          `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        settings.onChange(monthData);
      } else {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        settings.onChange(`${date.getFullYear()}${mm}${dd}`);
      }
    } else {
      settings.onChange?.('');
    }
  };

  const RemoveDate = () => {
    setSelectedDate(null);
    settings.onChange?.('');
  };

  const dateOpen = () => {
    notifyOpen(); // ✅ 아이콘으로 열 때도 다른 것 닫기
    datePickerRef.current?.setOpen?.(true);
  };

  const portalId =
    settings.isGrid ? PORTAL_GRID : PORTAL_FORM; // ✅ 용도별 포탈 분리

  const commonProps: any = {
    ref: datePickerRef,
    className: settings.isGrid ? styles.DatePickerGrid : styles.DatePicker,
    locale: ko,
    selected: selectedDate,
    onChange: (date: any) => changeDate(date),
    popperPlacement: 'bottom-start',
    popperProps: { strategy: 'fixed' },

    // ✅ 포탈로 body에 붙이기
    portalId,

    // ✅ input 클릭으로 열 때도 이벤트 발행
    onCalendarOpen: notifyOpen,
  };
//   // ✅ portal root를 body에 1번만 생성
//   useEffect(() => {
//     let el = document.getElementById(PORTAL_ID);
//     if (!el) {
//       el = document.createElement('div');
//       el.id = PORTAL_ID;
//       document.body.appendChild(el);
//     }
//   }, []);

//   const parseDateValue = useCallback((value: any) => {
//     if (!value) return null;

//     let dateValue: Date;

//     if (settings.type === 'year') {
//       dateValue = new Date(value, 0);
//     } else if (settings.type === 'month') {
//       const year = Math.floor(value / 100);
//       const month = (value % 100) - 1;
//       dateValue = new Date(year, month);
//     } else {
//       const year = Math.floor(value / 10000);
//       const month = Math.floor((value % 10000) / 100) - 1;
//       const day = value % 100;
//       dateValue = new Date(year, month, day);
//     }

//     return isNaN(dateValue.getTime()) ? null : dateValue;
//   }, [settings.type]);

//   useEffect(() => {
//     const dateValue = parseDateValue(settings.value);
//     setSelectedDate(dateValue);
//   }, [settings.value, parseDateValue]);

//   const changeDate = (date: any) => {
//     setSelectedDate(date);

//     if (settings.onChange && date !== null) {
//       if (settings.type === 'year') {
//         settings.onChange(date.getFullYear());
//       } else if (settings.type === 'month') {
//         const monthData =
//           date.getFullYear().toString() +
//           String(date.getMonth() + 1).padStart(2, '0');
//         settings.onChange(monthData);
//       } else {
//         const mm = String(date.getMonth() + 1).padStart(2, '0');
//         const dd = String(date.getDate()).padStart(2, '0');
//         settings.onChange(`${date.getFullYear()}${mm}${dd}`);
//       }
//     } else {
//       settings.onChange('');
//     }
//   };

//   const RemoveDate = () => {
//     setSelectedDate(null);
//     settings.onChange?.('');
//   };

//   const dateOpen = () => {
//     datePickerRef.current?.setOpen?.(true);
//   };

//   // ✅ 그리드에서는 portal로 띄우는 게 핵심
//   const commonProps = {
//     ref: datePickerRef,
//     className: settings.isGrid ? styles.DatePickerGrid : styles.DatePicker,
//     locale: ko,
//     selected: selectedDate,
//     onChange: (date: any) => changeDate(date),
//     popperPlacement: 'bottom-start' as const,
//     popperProps: { strategy: 'fixed' as const },

//     // ✅ 팝업을 body로 올려서 그리드 레이어 영향을 제거
//     portalId: settings.isGrid ? PORTAL_ID : undefined,
//   };

  if (settings.type === 'year') {
    return (
      <div className={styles.Wrap} style={{ margin: settings.isGrid ? '0 5px' : '3px 5px' }}>
        {settings.name && (
          <div className={styles.DatePickTitle} style={{ color: settings.isRequire ? 'red' : 'rgb(144, 144, 144)' }}>
            {settings.name}
          </div>
        )}

        <div className={styles.DatePickerWrap}>
          <DatePicker
            {...commonProps}
            dateFormat="yyyy"
            shouldCloseOnSelect
            showYearPicker
            minDate={new Date('2000-01-01')}
            maxDate={new Date('2999-12-31')}
            yearItemNumber={8}
            calendarClassName={styles.calenderWrapper}
          />

          <div className={styles.calendarImgWrap} onClick={dateOpen}>
            <div className={settings.isGrid ? styles.calendarImgGrid : styles.calendarImg} />
          </div>

          {settings.isGrid === false && (
            <div className={styles.xBtnWrap}>
              <button
                className={styles.BtnClear}
                onClick={RemoveDate}
                style={{ display: selectedDate ? 'inline-block' : 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (settings.type === 'month') {
    return (
      <div className={styles.Wrap}>
        {settings.name && (
          <div className={styles.DatePickTitle} style={{ color: settings.isRequire ? 'red' : 'rgb(144, 144, 144)' }}>
            {settings.name}
          </div>
        )}

        <div className={styles.DatePickerWrap}>
          <DatePicker
            {...commonProps}
            dateFormat="yyyy-MM"
            shouldCloseOnSelect
            showMonthYearPicker
            minDate={new Date('2000-01')}
            maxDate={new Date('2999-12')}
          />

          <div className={styles.calendarImgWrap} onClick={dateOpen}>
            <div className={settings.isGrid ? styles.calendarImgGrid : styles.calendarImg} />
          </div>

          {settings.isGrid === false && (
            <div className={styles.xBtnWrap}>
              <button
                className={styles.BtnClear}
                onClick={RemoveDate}
                style={{ display: selectedDate ? 'inline-block' : 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Wrap}>
      {settings.name && (
        <div className={styles.DatePickTitle} style={{ color: settings.isRequire ? 'red' : 'rgb(144, 144, 144)' }}>
          {settings.name}
        </div>
      )}

      <div className={styles.DatePickerWrap}>
        <DatePicker
          {...commonProps}
          dateFormat="yyyy-MM-dd"
          shouldCloseOnSelect
          showYearDropdown
          minDate={new Date('2000-01-01')}
          maxDate={new Date('2999-12-31')}
        />

        <div className={styles.calendarImgWrap} onClick={dateOpen}>
          <div className={settings.isGrid ? styles.calendarImgGrid : styles.calendarImg} />
        </div>

        {settings.isGrid === false && (
          <div className={styles.xBtnWrap}>
            <button
              className={styles.BtnClear}
              onClick={RemoveDate}
              style={{ display: selectedDate ? 'inline-block' : 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePick;
