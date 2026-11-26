import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import useStores from "../hooks/useStores";
import type { Store } from "../types/store";
import { formatScore, rankStores } from "../utils/rating";
import { coverPhoto, lookOf } from "../components/hotplace/look";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";

export default function Saved() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [savedStore, setSavedStore] = useState<Store[]>([]);
  const [fetching, setFetching] = useState(true);

  // 찜 목록 → shops에서 가게 정보 조회
  useEffect(() => {
    if (!user) {
      setSavedStore([]);
      setFetching(false);
      return;
    }
    setFetching(true);
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
    fetchSaved()
      .catch((e) => console.error("찜 목록 불러오기 실패", e))
      .finally(() => setFetching(false));
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
              내 찜 목록 {!fetching && <span className="text-rose-500">{savedStore.length}</span>}
            </h1>
            {fetching ? (
              <ul className="mt-5 space-y-3" aria-label="찜 목록 불러오는 중">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-20 animate-pulse rounded-3xl bg-white/70" />
                ))}
              </ul>
            ) : savedStore.length === 0 ? (
              <EmptySaved />
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

const SUGGEST = 3;

// 찜한 가게가 없을 때: 안내 + 바로 갈 수 있는 버튼 + 인기 가게 추천
function EmptySaved() {
  const nav = useNavigate();
  const { stores } = useStores();
  const popular = useMemo(() => rankStores(stores).slice(0, SUGGEST), [stores]);

  return (
    <div className="mt-8">
      <section className="flex flex-col items-center rounded-[28px] bg-white/80 px-6 py-10 text-center shadow-sm">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-rose-200 bg-rose-50">
          <span className="text-5xl" aria-hidden="true">🍰</span>
          <span className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow" aria-hidden="true">♡</span>
        </div>
        <p className="mt-5 text-lg font-bold text-amber-950">아직 찜한 가게가 없어요</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          마음에 드는 가게에서 <span className="font-semibold text-rose-500">♡</span>를 누르면
          <br />
          여기에 모아둘 수 있어요
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2 sm:flex-row">
          <button onClick={() => nav("/")}
            className="flex-1 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600">
            🗺️ 지도에서 찾기
          </button>
          <button onClick={() => nav("/hotplace")}
            className="flex-1 rounded-full border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-50">
            🔥 핫플 구경하기
          </button>
        </div>
      </section>

      {popular.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold text-amber-950">이런 곳은 어때요?</h2>
          <p className="text-xs text-amber-900/60">킁킁 유저들이 별점을 높게 준 가게예요</p>
          <ul className="mt-3 space-y-2">
            {popular.map((store) => (
              <li key={store.id}>
                <SuggestCard store={store} onOpen={() => nav(`/shop/${store.id}`)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SuggestCard({ store, onOpen }: { store: Store; onOpen: () => void }) {
  const look = lookOf(store.category);
  const photo = coverPhoto(store);
  return (
    <button onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:shadow-md">
      <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-3xl ${look.bg}`}>
        {photo ? <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <span aria-hidden="true">{look.emoji[0]}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-gray-900">{store.name}</span>
        <span className="block truncate text-xs text-gray-500">{(store.category ?? []).join(" · ") || store.address}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
        <StarIcon size={14} /> {formatScore(store.avgRating)}
      </span>
    </button>
  );
}
