import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-FixedArea.module.css'

const FixedWrap= ({children}) => {

 
    return (
        <div>
            <div className={styles.FixedWrap}>
                {children}
            </div>
        </div>
    )
} 

export default FixedWrap;