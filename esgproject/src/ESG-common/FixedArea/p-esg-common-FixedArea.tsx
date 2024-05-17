import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-FixedArea.module.css'


const FixedArea = ({name}) => {

    if(name === ""){
        name = "";
    }

    return (
        <div className={styles.FixedArea}>
            <span className={styles.AreaName}>{name}</span>
            <div>영역 테스트1</div>
            <div>영역 테스트1</div>
            <div>영역 테스트1</div>
        </div>
    )
} 

export default FixedArea;