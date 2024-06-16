import React, { forwardRef } from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-GridTab.module.css';

interface GridTabItemProps {
    name: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const GridTabItem = forwardRef<HTMLDivElement, GridTabItemProps>(({ name, children, style }, ref) => {
    return (
        <div ref={ref} className={styles.GridTabItem} style={style}>
            {children}
        </div>
    );
});

export default GridTabItem;