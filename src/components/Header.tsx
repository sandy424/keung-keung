import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useStores from "../hooks/useStores";
import { searchStores, type MatchField } from "../utils/search";
import { formatScore } from "../utils/rating";
import { CURRENT_REGION } from "../config/region";
import StarIcon from "./StarIcon";
import ProfileMenu from "./ProfileMenu";

type Props = {
  inputValue: string;
  query: string;
  onInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onClear: () => void;
};

const FIELD_STYLE: Record<MatchField, string> = {
  이름: "bg-amber-950 text-white",
  태그: "bg-amber-900/5 text-amber-900/70",
  메뉴: "bg-amber-900/5 text-amber-900/70",
  소개: "bg-amber-900/5 text-amber-900/50",
};

const SUGGESTIONS = ["휘낭시에", "케이크", "소금빵", "ㅌㄹㅌ"];

// 검색어와 일치하는 부분 강조
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const idx = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-200/70 px-0.5 text-inherit">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function Header({ inputValue, query, onInputChange, onSearch, onClear }: Props) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { user, nickname } = useAuth();
  const { stores } = useStores();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchStores(stores, inputValue).slice(0, 7), [stores, inputValue]);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // '/' 키로 검색창 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goShop = (id: string) => {
    setOpen(false);
    inputRef.current?.blur();
    nav(`/shop/${id}`);
  };

  // 지도에서 검색 결과 전체 보기
  const submit = (value = inputValue) => {
    if (!value.trim()) return;
    onInputChange(value);
    onSearch(value);
    setOpen(false);
    inputRef.current?.blur();
    if (pathname !== "/") nav("/");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중 Enter 중복 방지
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (active >= 0 && hits[active]) goShop(hits[active].store.id);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open;

  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        {/* 로고 + 지역 */}
        <button onClick={() => { onClear(); nav("/"); }} className="flex shrink-0 items-center gap-2" aria-label="킁킁 홈">
          <img src="/Logo.svg" width={44} height={22} alt="" />
          <span className="hidden items-center gap-0.5 rounded-md border border-amber-900/10 px-2 py-0.5 text-xs font-semibold text-amber-900/70 sm:flex">
            {CURRENT_REGION.name}
          </span>
        </button>

        {/* 검색 */}
        <div ref={boxRef} className="relative min-w-0 flex-1 sm:mx-auto sm:max-w-md">
          <div className={`flex h-11 items-center gap-2 rounded-2xl border px-3.5 transition ${
            open ? "border-amber-300 bg-white ring-4 ring-amber-100" : "border-transparent bg-amber-50/80 hover:bg-amber-50"
          }`}>
            <img src="/Search.svg" width={18} height={18} alt="" className="opacity-50" />
            <input
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={(e) => { onInputChange(e.target.value); setOpen(true); setActive(-1); }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="가게, 태그, 메뉴로 찾아보세요"
              aria-label="디저트 가게 검색"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="search-results"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-amber-900/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {(inputValue || query) && (
              <button onClick={() => { onClear(); setActive(-1); inputRef.current?.focus(); }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-900/15 text-[10px] text-white hover:bg-amber-900/30"
                aria-label="검색어 지우기">✕</button>
            )}
            <kbd className="hidden rounded-md border border-amber-200 px-1.5 text-[11px] text-amber-900/40 lg:block">/</kbd>
          </div>

          {/* 검색 결과 드롭다운 */}
          {showDropdown && (
            <div id="search-results" role="listbox"
              className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-xl shadow-amber-950/10">
              {!inputValue.trim() ? (
                <div className="p-4">
                  <p className="text-xs font-semibold text-amber-900/40">이렇게 찾아보세요</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => { onInputChange(s); setActive(-1); inputRef.current?.focus(); }}
                        className="rounded-lg border border-amber-900/10 px-3 py-1 text-sm text-amber-900/70 hover:bg-amber-50">
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-amber-900/40">초성 검색도 돼요 (ㅋㅇㅋ → 케이크)</p>
                </div>
              ) : hits.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-amber-900/60">
                  ‘{inputValue}’와 맞는 가게가 없어요.<br />
                  <span className="text-xs text-amber-900/40">가게 이름, 태그, 메뉴로 다시 찾아보세요</span>
                </p>
              ) : (
                <>
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {hits.map(({ store, field, text }, i) => (
                      <li key={store.id} role="option" aria-selected={active === i}>
                        <button onMouseEnter={() => setActive(i)} onClick={() => goShop(store.id)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${active === i ? "bg-amber-50" : ""}`}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-amber-950">
                              <Highlight text={store.name} query={field === "이름" ? inputValue : ""} />
                            </p>
                            {field !== "이름" && (
                              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-amber-900/50">
                                <span className={`shrink-0 rounded px-1.5 py-px font-medium ${FIELD_STYLE[field]}`}>{field}</span>
                                <span className="truncate"><Highlight text={text} query={inputValue} /></span>
                              </p>
                            )}
                          </div>
                          <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-amber-950">
                            <StarIcon size={12} /> {formatScore(store.avgRating)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => submit()}
                    className="flex w-full items-center justify-between border-t border-amber-900/10 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50">
                    <span>지도에서 결과 모두 보기</span>
                    <span className="hidden text-xs text-amber-700/60 sm:inline">Enter ↵</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 사용자 */}
        <ProfileMenu user={user} nickname={nickname} />
      </div>
    </header>
  );
}
