import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function StoreCard({ store, onClose }) {
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState(null);
  const [percents, setPercents] = useState({tase: 0, mood: 0, kind: 0, price: 0});

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
   
  // 항목별 점수 불러와서 퍼센트 계산
  useEffect(() => {
    if (!store?.id) return;
    const fetchRatings = async () => {
      const snap = await getDocs(collection(db, "shops", store.id, "reviews"));
      const rated = snap.docs.map((d) => d.data()).filter((r) => r.rating); // 별점 있는 리뷰만

      if (rated.length === 0) {
        setPercents({ taste: 0, mood: 0, kind: 0, price: 0 });
        return;
      }

      const sum = { taste: 0, mood: 0, kind: 0, price: 0 };
      rated.forEach((r) => {
        sum.taste += r.rating.taste;
        sum.mood += r.rating.mood;
        sum.kind += r.rating.kind;
        sum.price += r.rating.price;
      });

      const n = rated.length;
      setPercents({
        taste: Math.round((sum.taste / n / 5) * 100),
        mood: Math.round((sum.mood / n / 5) * 100),
        kind: Math.round((sum.kind / n / 5) * 100),
        price: Math.round((sum.price / n / 5) * 100),
      });
    };
    fetchRatings();
  }, [store?.id]);

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
      await setDoc(ref, {
        shopId: store.id,
        name: store.name,
        savedAt: new Date(),
      });
    }
    setSaved(prev => !prev);
  };

  const stats = [
    { label: "맛", key: "taste" },
    { label: "분위기", key: "mood" },
    { label: "친절", key: "kind" },
    { label: "가격", key: "price" },
  ];

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
        <span className="font-semibold">{store.avgRating || "0.0"}</span>
      </div>
      <div className="mt-4 flex h-20 items-center justify-center border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700">
        가게 설명
      </div>

      {/* 퍼센트 측정 */}
      {stats.map(({ label, key }) => (
        <div key={key} className="mt-4 flex items-center gap-4">
          <p className="text-sm text-gray-600 w-20">{label}</p>
          <progress value={percents[key]} max={100} className="w-full h-3" />
          <div className="w-12 text-right text-xs font-medium text-gray-600">
            {percents[key]}%
          </div>
        </div>
      ))}

      {/* 상세페이지 버튼 */}
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
