import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-DynamicArea.module.css'

const DynamicArea = ({children}) => {
    return (
        <div className={styles.DynamicArea}>
            {children}
        </div>
    )
} 

export default DynamicArea;