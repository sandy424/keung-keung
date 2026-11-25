import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Header from "./components/Header";
import Hotplace from "./pages/Hotplace";
import Saved from "./pages/Saved";
import Mypage from "./pages/Mypage";
import Detail from "./pages/Detail";
import ReviewWrite from "./pages/ReviewWrite";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Intro from "./components/intro/Intro";

const INTRO_KEY = "kk-intro-seen";

// 인트로는 세션당 한 번만 (저장소가 막힌 환경에서도 앱이 동작하도록 try/catch)
const hasSeenIntro = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
};

export default function App() {
  const location = useLocation();
  const nav = useNavigate();
  const isIntroRoute = location.pathname === "/intro";
  // 첫 진입이 지도('/')일 때만 자동으로 인트로 표시, 공유 링크(/shop/:id)는 바로 보여줌
  const [showIntro, setShowIntro] = useState(() => location.pathname === "/" && !hasSeenIntro());

  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => setQuery(value.trim());
  const handleClear = () => {
    setInputValue("");
    setQuery("");
  };

  const finishIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* 저장 실패해도 무시 */
    }
    setShowIntro(false);
    if (isIntroRoute) nav("/", { replace: true });
  };

  return (
    <div className="flex h-dvh flex-col bg-[#fff9d4]">
      <Header inputValue={inputValue} onSearch={handleSearch} onInputChange={setInputValue} onClear={handleClear} query={query} />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home query={query} onClearQuery={handleClear} />} />
          <Route path="/intro" element={<Home query={query} onClearQuery={handleClear} />} />
          <Route path="/hotplace" element={<Hotplace />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/shop/:id" element={<Detail />} />
          <Route path="/shop/:id/review" element={<ReviewWrite />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {(showIntro || isIntroRoute) && <Intro onDone={finishIntro} />}
    </div>
  );
}
