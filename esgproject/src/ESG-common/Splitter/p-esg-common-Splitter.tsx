// [splitter.tsx]
import React, { useEffect, useMemo, useState } from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import './p-esg-common-Splitter.css';

// 화면 작아지면 무조건 세로로 나오게 변경
type SplitLayout = 'horizontal' | 'vertical';

type FormSplitProps = {
  children: React.ReactNode;
  SplitType: SplitLayout;
  FirstSize: number;
  SecondSize: number;
  mobileBreakpoint?: number;
};

const Split = ({ children, SplitType, FirstSize, SecondSize, mobileBreakpoint = 768 }: FormSplitProps) => {
  const contentsArray = React.Children.toArray(children);
  const firstContent = contentsArray[0];
  const secondContent = contentsArray[1];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq: MediaQueryList = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    setIsMobile(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    (mq as any).addListener(onChange);
    return () => (mq as any).removeListener(onChange);
  }, [mobileBreakpoint]);

  // ✅ 모바일에서는 Splitter를 쓰지 말고 그냥 세로 스택으로 렌더링
  if (isMobile) {
    return (
      <div className="com-splitter-mobile">
        <div className="com-splitter-mobile-panel">
          {firstContent}
        </div>
        <div className="com-splitter-mobile-panel">
          {secondContent}
        </div>
      </div>
    );
  }

  return (
    <Splitter
      style={{ height: "100%", width: "100%" }}
      className="mb-5 com-splitter"
      layout={SplitType}
      onResizeEnd={() => window.dispatchEvent(new Event('resize'))}
    >
      <SplitterPanel className="com-splitter-panel" size={FirstSize}>
        <div className="com-panel-fill">{firstContent}</div>
      </SplitterPanel>
      <SplitterPanel className="com-splitter-panel" size={SecondSize}>
        <div className="com-panel-fill">{secondContent}</div>
      </SplitterPanel>
    </Splitter>
  );
};

export default Split;
