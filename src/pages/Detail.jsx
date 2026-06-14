import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import style from '../css/Detail.module.css';
function Detail() {

    const location = useLocation();
    const store = location.state?.store;

    const [saved, setSaved] = useState(false);
    
    const toggleSaved = () => {
        setSaved(prev => !prev);
    };

    return(
        <div className={style.container}>
            <div className={style.header}>
                <img src='/Last.svg' width={24} height={24} className={style.lastBtn}
                    onClick={() => {}}/>
                
            </div>
            
            <div className={style.storeInfo}>
                <div className={style.firstInfo}>
                    <h2>{store.name}</h2>
                    <button type="button" onClick={toggleSaved} className={style.heartBtn}>
                        <img src='/SaveHeart.svg' width={35} height={35} color={saved ? 'red' : 'transparent'} />
                    </button>
                </div>
            </div>
        </div>
    )
}
export default Detail;