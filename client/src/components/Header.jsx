import style from '../css/Header.module.css';
import SearchIcon from '../assets/icons/Search.svg?react';
import LogoIcon from '../assets/icons/Logo.svg?react';
import { useNavigate } from 'react-router-dom';

export default function Header() {

    const nav = useNavigate();

    return(
        <div className={style.header}>
            <button onClick={() => nav("/")}>
                <LogoIcon width={50} height={30} />
            </button>
            
            <div className={style.search}>
                <input type="text" placeholder='좋아하는 디저트를 검색해보세요.' />
                <button className={style.iconBtn}>
                    <SearchIcon width={24} height={24} />
                </button>
            </div>
        </div>
    )
}