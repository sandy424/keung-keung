import style from '../css/Header.module.css';
import {FaSearch} from 'react-icons/fa';

export default function Header() {
    return(
        <div className={style.header}>
            <h3>Sweet Spot</h3>
            <input type="text" placeholder='좋아하는 디저트를 검색해보세요.' />
            <button className={style.iconBtn}>
                <FaSearch size={18}/>
            </button>
        </div>
    )
}