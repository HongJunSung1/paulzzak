import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-Toolbar.module.css';
import New from '../../assets/image/toolbar/new.svg';
import Query from '../../assets/image/toolbar/query.svg';
import Save from '../../assets/image/toolbar/save.svg';
import Cut from '../../assets/image/toolbar/cut.svg';

const ToolbarItem = ({item}) => {
    let image = "";

    if(item.image == "new"){
        image = New;
    } else if(item.image == "query"){
        image = Query;
    } else if(item.image == "save"){
        image = Save;
    } else if(item.image == "cut"){
        image = Cut;
    }

    return(
        <div className = {styles.ToolbarContent}>
            <div className = {styles.ToolbarButton}>
                <img className = {styles.ToolbarImage} src={image} alt={`${item.image}`}/>
                <div className = {styles.ToolbarTitle}>{item.title}</div>
            </div>
        </div>
    )
}

const Toolbar = ({items}) => {

    return(
        <>
            <div className = {styles.ToolbarWrap}>
                {
                    items.map((item, id) => (<ToolbarItem item={item} key={id}/>))
                }
            </div>
        </>
    )
}

export default Toolbar