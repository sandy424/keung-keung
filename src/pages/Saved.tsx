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
import HeartIcon from "../components/HeartIcon";

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
      <div className="h-full overflow-y-auto px-5 pb-36 pt-10 sm:px-8">
        {loading ? null : !user ? (
          <div className="flex flex-col items-center gap-4 pt-24 text-center">
            <p className="text-5xl">💝</p>
            <p className="font-bold text-amber-950">로그인이 필요한 서비스입니다.</p>
            <button onClick={() => nav("/login", { state: { from: "/saved" } })}
              className="rounded-full bg-amber-500 px-6 py-2.5 font-semibold text-white hover:bg-amber-600">로그인하기</button>
          </div>
        ) : (
          <>
            <h1 className="flex items-baseline gap-2 text-2xl font-bold text-amber-950">
              저장한 가게 {!fetching && <span className="text-base font-semibold tabular-nums text-amber-900/40">{savedStore.length}</span>}
            </h1>
            {fetching ? (
              <ul className="mt-6 space-y-2" aria-label="찜 목록 불러오는 중">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-16 animate-pulse rounded-2xl bg-white/70" />
                ))}
              </ul>
            ) : savedStore.length === 0 ? (
              <EmptySaved />
            ) : (
              <ul className="mt-6 divide-y divide-amber-900/10 rounded-2xl border border-amber-900/10 bg-white">
                {savedStore.map((store) => (
                  <li key={store.id}>
                    <StoreRow store={store} onOpen={() => nav(`/shop/${store.id}`)} />
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

// 찜한 가게가 없을 때: 안내 + 바로가기 + 인기 가게 추천
function EmptySaved() {
  const nav = useNavigate();
  const { stores } = useStores();
  const popular = useMemo(() => rankStores(stores).slice(0, SUGGEST), [stores]);

  return (
    <div className="mt-6">
      <section className="flex flex-col items-center rounded-2xl border border-amber-900/10 bg-white px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-900/40">
          <HeartIcon filled={false} size={22} />
        </span>
        <p className="mt-4 font-bold text-amber-950">아직 저장한 가게가 없어요</p>
        <p className="mt-1 text-sm text-amber-900/50">가게 상세에서 저장하기를 누르면 여기에 모여요</p>
        <div className="mt-6 flex items-center gap-4 text-sm">
          <button onClick={() => nav("/")}
            className="rounded-xl bg-amber-950 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-900">
            지도에서 찾기
          </button>
          <button onClick={() => nav("/hotplace")} className="font-semibold text-amber-950 underline-offset-4 hover:underline">
            핫플레이스 보기
          </button>
        </div>
      </section>

      {popular.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 px-1">
            <h2 className="text-base font-bold text-amber-950">이런 곳은 어때요?</h2>
            <p className="text-xs text-amber-900/50">별점이 높은 가게예요</p>
          </div>
          <ul className="divide-y divide-amber-900/10 rounded-2xl border border-amber-900/10 bg-white">
            {popular.map((store) => (
              <li key={store.id}>
                <StoreRow store={store} onOpen={() => nav(`/shop/${store.id}`)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StoreRow({ store, onOpen }: { store: Store; onOpen: () => void }) {
  const look = lookOf(store.category);
  const photo = coverPhoto(store);
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-amber-50/60">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-50 text-xl" aria-hidden="true">
        {photo ? <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : look.emoji[0]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-amber-950">{store.name}</span>
        <span className="block truncate text-xs text-amber-900/50">{(store.category ?? []).join(" · ") || store.address}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-amber-950">
        <StarIcon size={13} /> {formatScore(store.avgRating)}
      </span>
    </button>
  );
}
