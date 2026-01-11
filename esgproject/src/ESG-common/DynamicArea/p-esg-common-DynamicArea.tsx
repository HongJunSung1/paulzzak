import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-DynamicArea.module.css'

type DynamicAreaProps = {
  children: any;
};


const DynamicArea = ({children}: DynamicAreaProps) => {
    return (
        <div className={styles.DynamicArea}>
            {children}
        </div>
    )
} 

export default DynamicArea;