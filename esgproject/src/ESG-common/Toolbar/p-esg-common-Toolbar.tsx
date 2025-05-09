import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-Toolbar.module.css';
import New from '../../assets/image/toolbar/refresh.svg';
import Query from '../../assets/image/toolbar/query.svg';
import Save from '../../assets/image/toolbar/save.svg';
import Cut from '../../assets/image/toolbar/cut.svg';
import Jump from '../../assets/image/toolbar/jump.png'

const ToolbarItem = ({item,clickID}) => {

    const btnEvent = () =>{
        clickID(item.id);
    }

    let image = "";

    if(item.image === "new"){
        image = New;
    } else if(item.image === "query"){
        image = Query;
    } else if(item.image === "save"){
        image = Save;
    } else if(item.image === "cut"){
        image = Cut;
    } else if(item.image ==="jump"){
        image = Jump;
    }

    return(
        <div className = {styles.ToolbarContent}>
            <div className = {styles.ToolbarButton} onClick={btnEvent}>
                <img className = {styles.ToolbarImage} src={image} alt={`${item.image}`}/>
                <div className = {styles.ToolbarTitle}>{item.title}</div>
            </div>
        </div>
    )
}

const Toolbar = ({items,clickID}) => {
    return(
        <>
            <div className = {styles.ToolbarWrap}>
                {
                    items.map((item, id) => (<ToolbarItem item={item} key={id} clickID={clickID}/>))
                }
            </div>
        </>
    )
}

export default Toolbar