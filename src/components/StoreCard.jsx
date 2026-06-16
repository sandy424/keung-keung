import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function StoreCard({ store, onClose }) {
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState(null);
  const nav = useNavigate();

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

  const stats = ["맛", "분위기", "친절", "가격"];
  const progressValue = Math.round((store.rating / 5) * 100);

  return (
    <div className="absolute bottom-[25%] right-[20%] z-20 w-[360px] h-[480px] rounded-[20px] bg-white p-8 shadow-xl flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{store.category}</p>
        <button className="text-gray-500 hover:text-black" onClick={onClose}>✕</button>
      </div>

      {/* 좋아요 버튼 */}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{store.name}</h2>
        <button type="button" onClick={toggleSaved} className="inline-flex items-center justify-center rounded-full p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? "red" : "none"} stroke={saved ? "red" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
        <img src='/RateStar.svg' width={24} height={24} alt="별점" />
        <span className="font-semibold">{store.avgRating}</span>
      </div>
      <div className="mt-4 flex h-20 items-center justify-center border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700">
        가게 설명
      </div>
      {stats.map((label) => (
        <div key={label} className="mt-4 flex items-center gap-4">
          <p className="text-sm text-gray-600 w-20">{label}</p>
          <progress value={progressValue} max={100} className="w-full h-3" />
          <div className="w-12 text-right text-xs font-medium text-gray-600">{progressValue}%</div>
        </div>
      ))}
      <div className="mt-auto flex justify-center">
        <button
          onClick={() => nav("/detail", {state: {store}})}
          className="w-[130px] rounded-full bg-[#ffeddb] px-4 py-2 text-sm font-semibold text-[#ff8000] hover:bg-[#ffd3aa]"
        >
          상세페이지
        </button>
      </div>
    </div>
  );
}

export default StoreCard;
