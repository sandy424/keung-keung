import style from '../css/Header.module.css';
import SearchIcon from '../assets/icons/Search.svg?react';
import LogoIcon from '../assets/icons/Logo.svg?react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Header({inputValue, onInputChange, onSearch, onClear, query}) {
    
    const [userInfo, setUserInfo] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        const unsign = onAuthStateChanged(auth, (currentUser) => {
            setUserInfo(currentUser);
        });
        return() => unsign();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        nav("/");
    };
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

            <div className={style.authButtons}>
                {userInfo ? (
                    <>
                    <button className={style.loginBtn} onClick={handleLogout}>로그아웃</button>
                    </>
                ) : (
                    <>
                    <button className={style.loginBtn} onClick={() => nav("/login")}>
                        로그인
                    </button>
                    <button className={style.signupBtn} onClick={() => nav("/signup")}>
                        회원가입
                    </button>
                    </>
                )}
            </div>

        </div>
    )
}