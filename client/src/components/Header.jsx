import style from '../css/Header.module.css';
import {FaSearch} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Header() {

    const nav = useNavigate();

    return(
        <div className={style.header}>
            <h3 onClick={() => nav("/")}>킁킁</h3>
            <div className={style.search}>
                <input type="text" placeholder='좋아하는 디저트를 검색해보세요.' />
                <button className={style.iconBtn}>
                    <FaSearch size={20}/>
                </button>
            </div>
        </div>
    )
}