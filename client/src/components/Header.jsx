import style from '../css/Header.module.css';
import SearchIcon from '../assets/icons/Search.svg?react';
import LogoIcon from '../assets/icons/Logo.svg?react';
import { useNavigate } from 'react-router-dom';

export default function Header({inputValue, onInputChange, onSearch, onClear, query}) {
    
    const nav = useNavigate();

    const onLogoChange = () => {
        nav("/");
        onInputChange("");
    }

    return(
        <div className={style.header}>
            <button onClick={onLogoChange}>
                <LogoIcon width={50} height={30} />
            </button>
            
            <div className={style.search}>
                <input type="text" value={inputValue} placeholder='좋아하는 디저트를 검색해보세요.' 
                onChange={(e) => {onInputChange(e.target.value)}}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                />
                {query && (
                    <button onClick={onClear}>
                        ✕
                    </button>
                )}
                <button className={style.iconBtn} onClick={onSearch}>
                    <SearchIcon width={24} height={24} />
                </button>
            </div>
        </div>
    )
}