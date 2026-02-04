import style from '../css/Home.module.css';
import FireIcon from '../assets/icons/Fire.svg?react';
import HeartIcon from '../assets/icons/Heart.svg?react';
import ProfileIcon from '../assets/icons/Profile.svg?react';
import { useNavigate } from 'react-router-dom';

function Bottombar() {

    const nav = useNavigate();
  
    return(
        <div className={style.menu}>
                <button className={style.menuIcon} 
                  onClick={() => nav('/hotplace')}>
                  <FireIcon width={35} height={35} />
                  <div>핫플레이스</div>
                </button>
                <button className={style.menuIcon}
                  onClick={() => nav('/saved')}>
                  <HeartIcon width={30} height={30} />
                  <div>저장</div>
                </button>
                <button className={style.menuIcon}
                  onClick={() => nav('/mypage')}>
                  <ProfileIcon width={35} height={35}/>
                  <div>마이페이지</div>
                </button>
              </div>
    )
}
export default Bottombar;