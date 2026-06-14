import { useNavigate } from 'react-router-dom';
import style from '../css/Home.module.css';

function Bottombar() {

    const nav = useNavigate();
  
    return(
        <div className={style.menu}>
                <button className={style.menuIcon} 
                  onClick={() => nav('/hotplace')}>
                  <img src='/Fire.svg' width={35} height={35} />
                  <div>핫플레이스</div>
                </button>
                <button className={style.menuIcon}
                  onClick={() => nav('/saved')}>
                  <img src='/SaveHeart.svg' width={30} height={30} />
                  <div>저장</div>
                </button>
                <button className={style.menuIcon}
                  onClick={() => nav('/mypage')}>
                  <img src='Profile.svg' width={35} height={35}/>
                  <div>마이페이지</div>
                </button>
              </div>
    )
}
export default Bottombar;