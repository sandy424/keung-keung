import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import StoreDoc from '../components/StoreDoc';
import StoreMenu from '../components/StoreMenu';
import StoreReview from '../components/StoreReview';

export default function Detail() {

    const location = useLocation();
    const nav = useNavigate();
    const store = location.state?.store;

    const [saved, setSaved] = useState(false);
    const [userId, setUserId] = useState(null);
    const [detailTab, setDetailTab] = useState("정보");
    
    // 로그인 감지
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
          setUserId(user ? user.uid : null);
        });
        return() => unsub();
    }, []);
    
    // 찜 여부 확인
    useEffect(() => {
        if (!userId || !store) return;
        const checkSaved = async () => {
          const ref = doc(db, "users", userId, "saved", store.id);
          const snap = await getDoc(ref);
          setSaved(snap.exists());
        };
        checkSaved();
    }, [userId, store]);
      
    if (!store) return null;
       
    // 찜 토글
    const toggleSaved = async () => {
        if (!userId) {
          alert("로그인이 필요합니다.");
          nav("/login");
          return;
        }
        const ref = doc(db, "users", userId, "saved", store.id);
        if(saved) {
          await deleteDoc(ref);
        } else {
          await setDoc(ref, {shopId: store.id, savedAt: new Date()});
        }
        setSaved(prev => !prev);
    };
    
    const storeDoc = useRef(null);
    const storeMenu = useRef(null);
    const storeReview = useRef(null);

    const handleTab = (tab) => {
        setDetailTab(tab);
        if(tab === "정보") storeDoc.current?.scrollIntoView({ behavior : "smooth"});
        if(tab === "메뉴") storeMenu.current?.scrollIntoView({ behavior : "smooth"});
        if(tab === "리뷰") storeReview.current?.scrollIntoView({ behavior : "smooth"});
    };
    
    return(
        <div className="mx-auto w-full max-w-175 h-screen overflow-y-auto bg-white">
            <div className="flex items-center p-5">
                <button onClick={() => nav(-1)} className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2">
                    <img src='/Last.svg' width={24} height={24} alt="뒤로가기" />
                </button>
            </div>

            <div className="m-6 p-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{store?.name}</h2>
                    <button type="button" onClick={toggleSaved} className="inline-flex items-center justify-center rounded-full p-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? "red" : "none"} stroke={saved ? "red" : "currentColor"} strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                </div>

                <div className="flex items-center pt-4 text-base gap-12">
                    <span className="text-gray-500">{store?.category}</span>
                    <div className="gap-2 text-gray-700">
                        <img src='/RateStar.svg' width={24} height={24} alt="별점" />
                        <span className="font-semibold">{store.avgRating}</span>
                    </div>
                    <span>리뷰 {store?.reviewcount}</span>
                </div>

                <div className="flex py-14 justify-center text-lg font-bold gap-45 text-gray-500">
                    {["정보", "메뉴", "리뷰"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTab(tab)}
                            className={`flex-1 py-2 text-lg font-bold cursor-pointer ${
                                detailTab === tab
                                ? "text-black"
                                : "border-transparent text-gray-400"
                            }`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div ref={storeDoc} className='p-6'>
                    <StoreDoc store={store} />
                </div>
                <div ref={storeMenu} className='p-6'>
                    <StoreMenu store={store} />
                </div>
                <div ref={storeReview} className='p-6'>
                    <StoreReview store={store} />
                </div>
            </div>
        </div>
    )
}