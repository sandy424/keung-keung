import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import type { Store } from "../types/store";
import { formatScore } from "../utils/rating";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";

export default function Saved() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [savedStore, setSavedStore] = useState<Store[]>([]);

  // 찜 목록 → shops에서 가게 정보 조회
  useEffect(() => {
    if (!user) {
      setSavedStore([]);
      return;
    }
    const fetchSaved = async () => {
      const snap = await getDocs(collection(db, "users", user.uid, "saved"));
      const shopIds = snap.docs.map((d) => d.data().shopId as string);
      const stores = await Promise.all(
        shopIds.map(async (id) => {
          const shopSnap = await getDoc(doc(db, "shops", id));
          return shopSnap.exists() ? ({ id: shopSnap.id, ...shopSnap.data() } as Store) : null;
        })
      );
      setSavedStore(stores.filter((s): s is Store => s !== null));
    };
    fetchSaved().catch((e) => console.error("찜 목록 불러오기 실패", e));
  }, [user]);

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="h-full overflow-y-auto px-6 pb-36 pt-8">
        {loading ? null : !user ? (
          <div className="flex flex-col items-center gap-4 pt-24 text-center">
            <p className="text-5xl">💝</p>
            <p className="font-bold text-amber-950">로그인이 필요한 서비스입니다.</p>
            <button onClick={() => nav("/login", { state: { from: "/saved" } })}
              className="rounded-full bg-amber-500 px-6 py-2.5 font-semibold text-white hover:bg-amber-600">로그인하기</button>
          </div>
        ) : (
          <>
            <h1 className="flex gap-2 text-2xl font-bold text-amber-950">
              내 찜 목록 <span className="text-rose-500">{savedStore.length}</span>
            </h1>
            {savedStore.length === 0 ? (
              <p className="mt-10 text-center text-sm text-gray-500">지도에서 ♡를 눌러 가게를 저장해 보세요</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {savedStore.map((store) => (
                  <li key={store.id}>
                    <button onClick={() => nav(`/shop/${store.id}`)}
                      className="flex w-full items-center gap-3 rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-900">{store.name}</p>
                        <p className="truncate text-sm text-gray-500">{store.address}</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <StarIcon size={14} /> {formatScore(store.avgRating)}
                      </span>
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
