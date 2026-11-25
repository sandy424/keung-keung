import { useEffect, useRef, useState, type CSSProperties } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../firebase";
import { GLYPH_1, GLYPH_2 } from "./logoGlyphs";
import { CURRENT_REGION } from "../../config/region";
import "./intro.css";

const TICKER = ["휘낭시에", "딸기 생크림 케이크", "에그타르트", "소금빵", "마카롱", "바스크 치즈케이크", "까눌레", "크로플", "말차 롤케이크", "스콘"];

// 위로 피어오르는 냄새 줄기 (x 위치, 지연, 굵기)
const TRAILS = [
  { x: 12, delay: 0.2, w: 2.5 },
  { x: 28, delay: 0.9, w: 1.5 },
  { x: 47, delay: 0.5, w: 3 },
  { x: 66, delay: 1.2, w: 2 },
  { x: 84, delay: 0.7, w: 2.5 },
];

// 반짝이는 설탕 가루
const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.6,
  dur: 3 + (i % 5),
}));

type Props = { onDone: () => void };

export default function Intro({ onDone }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [shopCount, setShopCount] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // 실제 등록된 맛집 수 (실패하면 문구 숨김)
  useEffect(() => {
    getCountFromServer(collection(db, "shops"))
      .then((snap) => setShopCount(snap.data().count))
      .catch(() => setShopCount(null));
  }, []);

  // 마우스/기울기에 따라 캐릭터가 살짝 따라오는 패럴랙스
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(onDone, reduce ? 0 : 950);
  };

  // Enter / Space / Esc 로도 진입
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "Escape"].includes(e.key)) leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={rootRef} className={`kk-intro ${leaving ? "is-leaving" : ""}`} role="dialog" aria-label="킁킁 인트로">
      <div className="kk-glow" aria-hidden="true" />
      <div className="kk-grain" aria-hidden="true" />

      {/* 설탕 가루 */}
      <div className="kk-sparks" aria-hidden="true">
        {SPARKS.map((s, i) => (
          <span key={i} style={{
            left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
            animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
          }} />
        ))}
      </div>

      {/* 냄새 줄기 */}
      <svg className="kk-trails" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="kk-scent" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffcf7a" stopOpacity="0" />
            <stop offset=".45" stopColor="#ffcf7a" stopOpacity=".55" />
            <stop offset="1" stopColor="#ffe9c2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {TRAILS.map((t, i) => (
          <path key={i} className="kk-trail" vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${t.delay}s`, strokeWidth: t.w } as CSSProperties}
            d={`M${t.x} 110 C ${t.x - 9} 85, ${t.x + 9} 70, ${t.x} 52 S ${t.x - 8} 22, ${t.x + 2} -8`} />
        ))}
      </svg>

      {/* 캐릭터 */}
      <img src="/dessert1.png" alt="" className="kk-char kk-char--macaron" aria-hidden="true" />
      <img src="/dessert2.png" alt="" className="kk-char kk-char--cake" aria-hidden="true" />

      <button className="kk-skip" onClick={leave}>건너뛰기</button>

      <main className="kk-center">
        <p className="kk-eyebrow">{CURRENT_REGION.nameEn} · DESSERT · MAP</p>

        <h1 className="kk-logo" aria-label="킁킁">
          {[{ d: GLYPH_1, box: "0 0 17 18" }, { d: GLYPH_2, box: "18.35 0 17 18" }].map((g, i) => (
            <span key={i} className="kk-glyph" style={{ "--i": i } as CSSProperties}>
              <svg viewBox={g.box} aria-hidden="true">
                <defs>
                  <linearGradient id={`kk-gold-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff4d6" />
                    <stop offset=".55" stopColor="#ffc861" />
                    <stop offset="1" stopColor="#f08a3c" />
                  </linearGradient>
                </defs>
                <path d={g.d} fill={`url(#kk-gold-${i})`} />
              </svg>
              <span className="kk-puff" aria-hidden="true">킁!</span>
            </span>
          ))}
        </h1>

        <p className="kk-tagline">
          달콤한 냄새를 따라가면,<br />
          <em>{CURRENT_REGION.name}의 디저트 맛집</em>이 나와요
        </p>

        <button className="kk-cta" onClick={leave} autoFocus>
          <span>냄새 따라가기</span>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className={`kk-count ${shopCount ? "is-on" : ""}`}>
          {shopCount ? <>지금 <b>{shopCount}곳</b>의 맛집이 기다리고 있어요</> : " "}
        </p>
      </main>

      {/* 하단 디저트 티커 */}
      <div className="kk-ticker" aria-hidden="true">
        <div className="kk-ticker__track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}<i>✦</i></span>
          ))}
        </div>
      </div>
    </div>
  );
}
