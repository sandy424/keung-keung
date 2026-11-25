import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Header({inputValue, onInputChange, onSearch, onClear, query}) {
    
    const [userInfo, setUserInfo] = useState(null);
    const [nickname, setNickname] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        const unsign = onAuthStateChanged(auth, async (currentUser) => {
            setUserInfo(currentUser);

            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setNickname(userDoc.data().nickname);
                }
            } else {
                setNickname(null);
            }
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
        <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-white px-4 py-3 shadow-sm sm:gap-30 sm:p-5">
            <button onClick={onLogoChange} className="inline-flex items-center justify-center cursor-pointer">
                <img src='/Logo.svg' width={50} height={30} alt="킁킁 홈" />
            </button>
            
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
                <input
                    type="text"
                    value={inputValue}
                    placeholder='좋아하는 디저트를 검색해보세요.'
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className="w-full min-w-0 sm:w-95 h-10 rounded-full bg-gray-200 px-5 text-sm outline-none ring-0 focus:ring-2 focus:ring-yellow-300"
                />
                {query && (
                    <button onClick={onClear}>
                        ✕
                    </button>
                )}
                <button aria-label="검색" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-200 hover:bg-sky-300" onClick={onSearch}>
                    <img src='/Search.svg' width={24} height={24} />
                </button>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {userInfo ? (
                    <>
                        {nickname && (
                            <span className="hidden text-sm text-gray-700 sm:inline">{nickname}님</span>
                        )}
                        <button className="text-sm text-gray-600 hover:text-black px-2 py-1 cursor-pointer" onClick={handleLogout}>로그아웃</button>
                    </>
                ) : (
                    <>
                        <button className="text-sm text-gray-600 hover:text-black px-2 py-1 cursor-pointer" onClick={() => nav("/login")}>
                            로그인
                        </button>
                        <button className="text-sm text-gray-600 hover:text-black px-2 py-1 cursor-pointer" onClick={() => nav("/signup") }>
                            회원가입
                        </button>
                    </>
                )}
            </div>

        </div>
    )
}