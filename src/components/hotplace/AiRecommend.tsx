import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Store } from "../../types/store";
import { CURRENT_REGION } from "../../config/region";
import { formatScore, toScore } from "../../utils/rating";
import { searchStores } from "../../utils/search";
import StarIcon from "../StarIcon";
import { coverPhoto, lookOf } from "./look";

const MOODS = [
  { label: "비 오는 날", prompt: "비 오는 날 따뜻하게 쉬어가기 좋은 디저트 가게" },
  { label: "데이트", prompt: "분위기 좋은 데이트 디저트 카페" },
  { label: "선물용", prompt: "포장해서 선물하기 좋은 디저트" },
  { label: "혼자 조용히", prompt: "혼자 조용히 작업하거나 책 읽기 좋은 디저트 카페" },
  { label: "상큼한 게 당겨", prompt: "상큼하고 과일이 들어간 디저트가 먹고 싶어요" },
  { label: "요즘 인기", prompt: "요즘 평이 제일 좋은 디저트 맛집" },
];

type Pick = { id: string; reason: string; menu: string };
type Result = { summary: string; picks: Pick[]; source: "ai" | "local" };

// 서버(API 키)가 없을 때 쓰는 간단 추천: 태그·메뉴·소개 키워드 매칭 + 별점
function localRecommend(stores: Store[], prompt: string): Result {
  const words = prompt.split(/[\s,.!?]+/).filter((w) => w.length >= 2);
  const picks = stores
    .map((store) => {
      const hits = words.filter((w) => searchStores([store], w).length > 0);
      return { store, hits, score: hits.length * 2 + (toScore(store.avgRating) ?? 0) * 0.3 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ store, hits }) => ({
      id: store.id,
      reason: hits.length
        ? `‘${hits.join("’, ‘")}’ 냄새가 나는 곳이에요.`
        : `별점 ${formatScore(store.avgRating)}점, 다들 좋아하는 곳이에요.`,
      menu: store.menus?.[0]?.name ?? "",
    }));
  return { summary: "이런 곳은 어때요?", picks, source: "local" };
}

// 서버리스 함수로 보낼 가게 요약 (필요한 정보만)
const compact = (s: Store) => ({
  id: s.id,
  name: s.name.slice(0, 60),
  category: (s.category ?? []).slice(0, 8),
  tags: (s.tags ?? []).slice(0, 12),
  menus: (s.menus ?? []).map((m) => m.name.slice(0, 40)).slice(0, 12),
  avgRating: toScore(s.avgRating),
  reviewCount: s.reviewCount ?? null,
  description: s.description?.slice(0, 120) || undefined,
  hours: s.hours?.slice(0, 60) || undefined,
});

// 킁킁이(마카롱 캐릭터)가 기분에 맞는 가게를 골라주는 섹션
export default function AiRecommend({ stores }: { stores: Store[] }) {
  const nav = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const ask = async (text: string) => {
    const q = text.trim().slice(0, 200);
    if (!q || loading || stores.length === 0) return;
    setPrompt(q);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: q, region: CURRENT_REGION.name, stores: stores.slice(0, 80).map(compact) }),
      });
      if (res.status === 404 || res.status === 503) {
        // 로컬 개발(vite) 또는 API 키 미설정 → 간단 추천으로 대체
        setResult(localRecommend(stores, q));
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "추천을 불러오지 못했어요.");
      } else {
        const data = await res.json();
        setResult({ summary: data.summary, picks: data.picks ?? [], source: "ai" });
      }
    } catch {
      setResult(localRecommend(stores, q));
    } finally {
      setLoading(false);
    }
  };

  const byId = new Map(stores.map((s) => [s.id, s]));
  const bubble = loading
    ? "킁킁… 어울리는 냄새를 찾고 있어요"
    : error || result?.summary || "오늘은 어떤 디저트가 땡겨요?";

  return (
    <section className="rounded-2xl border border-amber-900/10 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-amber-950">킁킁이의 추천</h2>
      <p className="mt-0.5 text-sm text-amber-900/50">기분을 알려주면 킁킁이가 딱 맞는 가게를 찾아줘요</p>

      {/* 캐릭터 + 말풍선 */}
      <div className="mt-4 flex items-end gap-3">
        <img src="/dessert1.png" alt="킁킁이" width={72} height={72}
          className={`h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-1 ring-amber-900/10 ${loading ? "animate-bounce" : ""}`} />
        <p className={`relative mb-3 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm font-medium ${
          error ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-950"
        }`}>
          {bubble}
        </p>
      </div>

      {/* 기분 칩 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button key={m.label} onClick={() => ask(m.prompt)} disabled={loading}
            className={`rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-40 ${
              prompt === m.prompt ? "border-amber-950 bg-amber-950 text-white" : "border-amber-900/15 bg-white text-amber-900/70 hover:bg-amber-50"
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(prompt); }}>
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={200}
          placeholder="예: 광안리에서 바다 보면서 먹을 케이크"
          className="min-w-0 flex-1 rounded-xl border border-amber-900/15 bg-white px-4 py-3 text-sm outline-none placeholder:text-amber-900/35 focus:border-amber-950" />
        <button type="submit" disabled={loading || !prompt.trim()}
          className="shrink-0 rounded-xl bg-amber-950 px-4 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-30">
          찾기
        </button>
      </form>

      {/* 결과 */}
      <div aria-live="polite">
        {loading && (
          <div className="mt-4 grid gap-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-[76px] animate-pulse rounded-xl bg-amber-50" />)}
          </div>
        )}

        {result && result.picks.length === 0 && (
          <p className="mt-4 text-center text-sm text-amber-900/50">딱 맞는 가게를 못 찾았어요. 다르게 말해줄래요?</p>
        )}

        {result && result.picks.length > 0 && (
          <ol className="mt-4 grid gap-2">
            {result.picks.map((p, i) => {
              const store = byId.get(p.id);
              if (!store) return null;
              const look = lookOf(store.category);
              return (
                <li key={p.id}>
                  <button onClick={() => nav(`/shop/${store.id}`)}
                    className="flex w-full items-start gap-3 rounded-xl border border-amber-900/10 p-3 text-left transition hover:border-amber-900/25 hover:bg-amber-50/50">
                    <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-3xl ${look.bg}`}>
                      {coverPhoto(store) ? <img src={coverPhoto(store)!} alt="" className="h-full w-full rounded-xl object-cover" /> : look.emoji[0]}
                      <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-950 text-[11px] font-bold text-white">{i + 1}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-amber-950">{store.name}</p>
                        <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-amber-950">
                          <StarIcon size={12} /> {formatScore(store.avgRating)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm leading-snug text-amber-900/70">{p.reason}</p>
                      {p.menu && <p className="mt-1 text-xs font-medium text-amber-600">추천 메뉴 · {p.menu}</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
