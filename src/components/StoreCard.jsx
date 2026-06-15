import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StoreCard({ store, onClose }) {
  const [saved, setSaved] = useState(false);
  const nav = useNavigate();

  if (!store) return null;

  const toggleSaved = () => {
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
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{store.name}</h2>
        <button type="button" onClick={toggleSaved} className="inline-flex items-center justify-center rounded-full p-1">
          <img src='/SaveHeart.svg' width={35} height={35} alt="저장" />
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
        <div key={label} className="mt-3 flex items-center gap-4">
          <p className="text-sm text-gray-600 w-12">{label}</p>
          <progress value={progressValue} max={100} className="w-full h-3" />
          <div className="w-12 text-right text-sm font-medium text-gray-600">{progressValue}%</div>
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
