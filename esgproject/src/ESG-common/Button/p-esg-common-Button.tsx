import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-Button.module.css';

const Button = (settings : any) => {

    return(
        <>
            <div className={styles.ButtonContainer}>
                <button className={styles.Button} onClick={settings.clickEvent} style={{width: settings.width? settings.width : 200}}>{settings.name}</button>
            </div>
        </>
    )
}

export default Button