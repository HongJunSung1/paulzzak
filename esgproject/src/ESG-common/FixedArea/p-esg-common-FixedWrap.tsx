import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-FixedArea.module.css'

type FixedWrapProps = {
  children: any;
};

const FixedWrap= ({children}: FixedWrapProps) => {

 
    return (
        <div>
            <div className={styles.FixedWrap}>
                {children}
            </div>
        </div>
    )
} 

export default FixedWrap;