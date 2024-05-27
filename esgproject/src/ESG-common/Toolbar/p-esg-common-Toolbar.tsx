import React from 'react'
import '../../global.d.ts';
import styles from './p-esg-common-Toolbar.module.css';
import New from '../../assets/image/toolbar/new.svg';
import Query from '../../assets/image/toolbar/query.svg';
import Save from '../../assets/image/toolbar/save.svg';
import Cut from '../../assets/image/toolbar/cut.svg';

import { SP_Request } from '../../hooks/sp-request.tsx';
const ToolbarItem = ({item,resData,isLoading}) => {

    const fetchData = async () => {
        isLoading(true);
        try {
            if(item.image ==="query"){
                const result = await SP_Request(item.spName, [{id : 1, name: '신은규' },{id : 2, name : '홍준성'}]);
                resData(result);
            }
        } catch (error) {
            console.log(error);
        }
        isLoading(false);
    };


    let image = "";

    if(item.image === "new"){
        image = New;
    } else if(item.image === "query"){
        image = Query;
    } else if(item.image === "save"){
        image = Save;
    } else if(item.image === "cut"){
        image = Cut;
    }

    return(
        <div className = {styles.ToolbarContent}>
            <div className = {styles.ToolbarButton} onClick={fetchData}>
                <img className = {styles.ToolbarImage} src={image} alt={`${item.image}`}/>
                <div className = {styles.ToolbarTitle}>{item.title}</div>
            </div>
        </div>
    )
}

const Toolbar = ({items,resData,isLoading}) => {
    return(
        <>
            <div className = {styles.ToolbarWrap}>
                {
                    items.map((item, id) => (<ToolbarItem item={item} key={id} resData={resData} isLoading={isLoading}/>))
                }
            </div>
        </>
    )
}

export default Toolbar