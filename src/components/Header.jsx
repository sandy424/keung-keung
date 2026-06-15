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
        <div className="flex items-center justify-center gap-30 bg-white p-5 shadow-sm">
            <button onClick={onLogoChange} className="inline-flex items-center justify-center cursor-pointer">
                <img src='/Logo.svg' width={50} height={30} />
            </button>
            
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    placeholder='좋아하는 디저트를 검색해보세요.'
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className="w-95 h-10 rounded-full bg-gray-200 px-5 text-sm outline-none ring-0 focus:ring-2 focus:ring-yellow-300"
                />
                {query && (
                    <button onClick={onClear}>
                        ✕
                    </button>
                )}
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-200 hover:bg-sky-300" onClick={onSearch}>
                    <img src='/Search.svg' width={24} height={24} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                {userInfo ? (
                    <button className="text-sm text-gray-600 hover:text-black px-2 py-1" onClick={handleLogout}>로그아웃</button>
                ) : (
                    <>
                        <button className="text-sm text-gray-600 hover:text-black px-2 py-1" onClick={() => nav("/login")}>
                            로그인
                        </button>
                        <button className="text-sm text-gray-600 hover:text-black px-2 py-1" onClick={() => nav("/signup") }>
                            회원가입
                        </button>
                    </>
                )}
            </div>

        </div>
    )
}