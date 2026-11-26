import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase";

type Props = { user: User | null; nickname: string | null };

// 헤더 오른쪽: 로그인 전엔 로그인/회원가입, 로그인 후엔 프로필 드롭다운
export default function ProfileMenu({ user, nickname }: Props) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 페이지 이동 시 닫기
  useEffect(() => setOpen(false), [pathname]);

  // 바깥 클릭 / Esc로 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => nav("/signup", { state: { from: pathname } })}
          className="hidden rounded-full px-3 py-2 text-sm font-medium text-amber-900/70 hover:bg-amber-50 hover:text-amber-950 sm:block">
          회원가입
        </button>
        <button onClick={() => nav("/login", { state: { from: pathname } })}
          className="rounded-full bg-amber-950 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900">
          로그인
        </button>
      </div>
    );
  }

  const name = nickname ?? "디저트 탐험가";
  const initial = name.slice(0, 1);

  const go = (to: string) => {
    setOpen(false);
    nav(to);
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      setOpen(false);
      nav("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const items = [{ icon: "👤", label: "마이페이지", to: "/mypage" }];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button ref={buttonRef} onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu" aria-expanded={open} aria-label={`${name}님 메뉴`}
        className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-1 transition sm:pr-2.5 ${
          open ? "border-amber-200 bg-amber-50" : "border-transparent hover:bg-amber-50"
        }`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-950 text-sm font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-24 truncate text-sm font-semibold text-amber-950 sm:inline">{name}</span>
        <svg className={`hidden h-4 w-4 text-amber-900/50 transition sm:block ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div role="menu" aria-label="내 메뉴"
          className="absolute right-0 top-[calc(100%+8px)] w-60 origin-top-right animate-[cardPop_.15s_ease-out] overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-xl shadow-amber-950/10">
          {/* 프로필 */}
          <div className="flex items-center gap-3 border-b border-amber-900/10 px-4 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-950 text-lg font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-amber-950">{name}님</p>
              <p className="truncate text-xs text-amber-900/50">{user.email}</p>
            </div>
          </div>

          <ul className="py-1.5">
            {items.map((item) => (
              <li key={item.to}>
                <button role="menuitem" onClick={() => go(item.to)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-amber-50 ${
                    pathname === item.to ? "font-semibold text-amber-950" : "text-amber-900/70"
                  }`}>
                  <span className="w-5 text-center" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-amber-900/10 p-1.5">
            <button role="menuitem" onClick={logout} disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-amber-900/60 hover:bg-amber-50 hover:text-amber-950 disabled:opacity-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              {loggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
