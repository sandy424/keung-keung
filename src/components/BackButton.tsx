import { useNavigate } from "react-router-dom";

// 이전 화면으로 돌아가기 (상세, 후기 작성 공통)
// 바로 들어온 경우(공유 링크 등)에는 돌아갈 화면이 없으니 지도로 이동
export default function BackButton() {
  const nav = useNavigate();
  const goBack = () => (window.history.state?.idx > 0 ? nav(-1) : nav("/"));

  return (
    <button type="button" onClick={goBack} aria-label="뒤로가기"
      className="flex h-10 w-10 items-center justify-center rounded-full text-amber-950 transition hover:bg-amber-50 active:scale-95">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
