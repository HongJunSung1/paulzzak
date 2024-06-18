import React, {useRef, useState, useEffect} from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-GridTab.module.css';

interface GridTabProps {
    children: React.ReactNode;
}

const GridTab: React.FC<GridTabProps> = ({ children }) => {
    const tabRefs = useRef<HTMLDivElement[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    // 탭 클릭 이벤트(클릭한 탭을 나오게 하고 아닌 탭은 display를 none으로 바꾼다.)
    const handleTabClick = (index: number) => {
        setActiveIndex(index); // 활성화된 탭 찾기
        
        tabRefs.current.forEach((ref, idx) => {
            if (ref) {
                ref.style.display = idx === index ? 'block' : 'none';
            }
            if(ref.style.display === 'block'){
                window.dispatchEvent(new Event('resize'));
            }

        });
    };

    useEffect(() => {
        // 랜더링 될 때 모든 정보 초기화
        // 처음엔 무조건 첫 번째 탭이 활성화 탭으로 나타나게 함
        tabRefs.current.forEach((ref, idx) => {
            if (ref) {
                ref.style.display = idx === 0 ? 'block' : 'none';
            }
            if(ref.style.display === 'block'){
                window.dispatchEvent(new Event('resize'));
            }
        });
    }, []);

    return (
        <>
            <div className={styles.GridTabContainer}>
                <div className={styles.GridTabTitleWrap}>
                    {React.Children.map(children, (child: any, index) => (
                        <div
                            key={index}
                            className={`${index === activeIndex ? styles.ActiveTab : styles.GridTabTitle}`}
                            onClick={() => handleTabClick(index)}
                        >
                            {child.props.name}
                        </div>
                    ))}
                </div>
                <div className={styles.GridTabContentsWrap}>
                    {React.Children.map(children, (child, index) =>
                        React.cloneElement(child as React.ReactElement, {
                            ref: (el: HTMLDivElement) => (tabRefs.current[index] = el),
                            style: { display: index === 0 ? 'block' : 'none' }
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default GridTab;