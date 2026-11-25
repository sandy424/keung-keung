import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Store } from "../../types/store";
import { CURRENT_REGION } from "../../config/region";
import { formatScore, toScore } from "../../utils/rating";
import { searchStores } from "../../utils/search";
import StarIcon from "../StarIcon";
import { lookOf } from "./look";

const MOODS = [
  { label: "☔ 비 오는 날", prompt: "비 오는 날 따뜻하게 쉬어가기 좋은 디저트 가게" },
  { label: "💑 데이트", prompt: "분위기 좋은 데이트 디저트 카페" },
  { label: "🎁 선물용", prompt: "포장해서 선물하기 좋은 디저트" },
  { label: "📚 혼자 조용히", prompt: "혼자 조용히 작업하거나 책 읽기 좋은 디저트 카페" },
  { label: "🍓 상큼한 게 당겨", prompt: "상큼하고 과일이 들어간 디저트가 먹고 싶어요" },
  { label: "🔥 요즘 핫한 곳", prompt: "요즘 평이 제일 좋은 디저트 맛집" },
];

type Pick = { id: string; reason: string; menu: string };
type Result = { summary: string; picks: Pick[]; source: "ai" | "local" };

// 서버(API 키)가 없을 때 쓰는 간단 추천: 태그·메뉴·소개 키워드 매칭 + 별점
function localRecommend(stores: Store[], prompt: string): Result {
  const words = prompt.split(/[\s,.!?]+/).filter((w) => w.length >= 2);
  const scored = stores.map((store) => {
    const hits = words.filter((w) => searchStores([store], w).length > 0);
    return { store, hits, score: hits.length * 2 + (toScore(store.avgRating) ?? 0) * 0.3 };
  });
  const picks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ store, hits }) => ({
      id: store.id,
      reason: hits.length
        ? `‘${hits.join("’, ‘")}’와 어울리는 태그·메뉴가 있는 곳이에요.`
        : `별점 ${formatScore(store.avgRating)}점으로 평이 좋은 곳이에요.`,
      menu: store.menus?.[0]?.name ?? "",
    }));
  return { summary: "키워드와 별점으로 골라봤어요.", picks, source: "local" };
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

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#1a100a] p-5 text-amber-50 shadow-xl sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.3em] text-amber-300/80">AI PICK</p>
        <h2 className="mt-1 text-xl font-bold">🤖 AI 추천 디저트 맛집</h2>
        <p className="mt-1 text-sm text-amber-100/60">지금 기분이나 상황을 알려주면, 킁킁에 모인 가게 중에서 골라드려요</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button key={m.label} onClick={() => ask(m.prompt)} disabled={loading}
              className="rounded-full border border-amber-200/20 bg-white/5 px-3 py-1.5 text-sm text-amber-50 transition hover:border-amber-300/60 hover:bg-white/10 disabled:opacity-40">
              {m.label}
            </button>
          ))}
        </div>

        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(prompt); }}>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={200}
            placeholder="예: 광안리에서 바다 보면서 먹을 케이크"
            className="min-w-0 flex-1 rounded-2xl border border-amber-200/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-amber-100/40 focus:border-amber-300/70" />
          <button type="submit" disabled={loading || !prompt.trim()}
            className="shrink-0 rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 px-4 text-sm font-bold text-amber-950 disabled:opacity-40">
            추천받기
          </button>
        </form>

        {/* 결과 */}
        <div className="mt-5" aria-live="polite">
          {loading && (
            <div className="space-y-3">
              <p className="text-sm text-amber-200"><span className="inline-block animate-bounce">👃</span> 킁킁… 어울리는 냄새를 찾는 중이에요</p>
              {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/10" />)}
            </div>
          )}

          {error && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}

          {result && (
            <>
              <p className="text-sm text-amber-100/90">{result.summary}</p>
              {result.picks.length === 0 ? (
                <p className="mt-3 text-sm text-amber-100/60">딱 맞는 가게를 찾지 못했어요. 다르게 물어봐 주세요!</p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {result.picks.map((p, i) => {
                    const store = byId.get(p.id);
                    if (!store) return null;
                    return (
                      <li key={p.id}>
                        <button onClick={() => nav(`/shop/${store.id}`)}
                          className="flex w-full gap-3 rounded-2xl bg-white p-4 text-left text-gray-900 transition hover:-translate-y-0.5">
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${lookOf(store.category).bg}`}>
                            {lookOf(store.category).emoji[0]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-bold">{i + 1}. {store.name}</p>
                              <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold"><StarIcon size={12} /> {formatScore(store.avgRating)}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{p.reason}</p>
                            {p.menu && <p className="mt-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">추천 메뉴 · {p.menu}</p>}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
              <p className="mt-3 text-right text-[11px] text-amber-100/40">
                {result.source === "ai" ? "Claude AI가 추천했어요 · 실제 정보는 가게에 확인해 주세요" : "AI 연결 전이라 키워드로 골랐어요"}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
