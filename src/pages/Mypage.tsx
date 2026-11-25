import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "../firebase";
import useAuth from "../hooks/useAuth";
import { formatDate } from "../utils/rating";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";

type MyReview = {
  id: string;
  shopId: string;
  shopName: string;
  text: string;
  avg: number | null;
  createdAt?: { toDate: () => Date } | null;
};

export default function Mypage() {
  const nav = useNavigate();
  const { user, nickname, loading } = useAuth();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    Promise.all([
      getDocs(query(collection(db, "users", uid, "reviews"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users", uid, "saved")),
    ])
      .then(([reviewSnap, savedSnap]) => {
        setReviews(reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as MyReview));
        setSavedCount(savedSnap.size);
      })
      .catch((e) => console.error("마이페이지 불러오기 실패", e));
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    nav("/");
  };

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="h-full overflow-y-auto px-6 pb-36 pt-8">
        {loading ? null : !user ? (
          <div className="flex flex-col items-center gap-4 pt-20 text-center">
            <img src="/dessert2.png" alt="" className="w-36 rounded-full shadow-lg" />
            <p className="text-lg font-bold text-amber-950">로그인하고 나만의 디저트 지도를 만들어요</p>
            <p className="text-sm text-amber-900/60">찜한 가게와 내가 쓴 후기를 한눈에 볼 수 있어요</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => nav("/login", { state: { from: "/mypage" } })}
                className="rounded-full bg-amber-500 px-6 py-2.5 font-semibold text-white hover:bg-amber-600">로그인</button>
              <button onClick={() => nav("/signup")}
                className="rounded-full bg-white px-6 py-2.5 font-semibold text-amber-900 hover:bg-amber-100">회원가입</button>
            </div>
          </div>
        ) : (
          <>
            {/* 프로필 */}
            <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
              <img src="/dessert2.png" alt="" className="h-16 w-16 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold text-gray-900">{nickname ?? "디저트 탐험가"}님</p>
                <p className="truncate text-sm text-gray-500">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-700">로그아웃</button>
            </div>

            {/* 통계 */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => nav("/saved")} className="rounded-3xl bg-white p-5 text-left shadow-sm hover:bg-rose-50">
                <p className="text-sm text-gray-500">찜한 가게</p>
                <p className="mt-1 text-3xl font-extrabold text-rose-500">{savedCount}</p>
              </button>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">내가 쓴 후기</p>
                <p className="mt-1 text-3xl font-extrabold text-amber-500">{reviews.length}</p>
              </div>
            </div>

            {/* 내 리뷰 */}
            <h2 className="mb-3 mt-8 text-lg font-bold text-amber-950">내 후기</h2>
            {reviews.length === 0 ? (
              <p className="rounded-3xl bg-white/60 py-10 text-center text-sm text-gray-500">
                아직 작성한 후기가 없어요. 지도에서 맛집을 찾아보세요!
              </p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => nav(`/shop/${r.shopId}`)}
                      className="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{r.shopName}</span>
                        <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                      </div>
                      {r.avg != null && (
                        <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-700">
                          <StarIcon size={14} /> {Number(r.avg).toFixed(1)}
                        </span>
                      )}
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{r.text}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <Bottombar />
    </div>
  );
}
