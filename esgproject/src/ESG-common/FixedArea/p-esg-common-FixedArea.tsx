import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-FixedArea.module.css'

type FixedAreaProps = {
  name: any;
  children: any;
};

const FixedArea= ({name, children}: FixedAreaProps) => {

    if(name === ""){
        name = "";
    }

    return (
        <div className={styles.FixedArea}>
            <div className={styles.AreaName}>
                ◎ {name}
            </div>
            <div>
                {children}
            </div>
        </div>
    )
} 

export default FixedArea;