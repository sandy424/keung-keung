import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!nickname || !password) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);

      // 닉네임으로 Firestore에서 이메일 조회
      const q = query(collection(db, "users"), where("nickname", "==", nickname));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("닉네임 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      const email = snapshot.docs[0].data().email;

      // 조회한 이메일로 로그인
      await signInWithEmailAndPassword(auth, email, password);
      nav("/");
    } catch (e: any) {
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("닉네임 또는 비밀번호가 올바르지 않습니다.");
      } else if (e.code === "auth/too-many-requests") {
        setError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setError("로그인에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-yellow-200 p-10 w-full max-w-sm">

        <div className="text-center mb-6">
          <div className="text-4xl mb-1">🍰</div>
          <h1 className="text-xl font-medium text-yellow-900 tracking-tight">keung-keung</h1>
          <p className="text-sm text-yellow-700 mt-1">디저트 가게 탐색</p>
        </div>

        <hr className="border-yellow-100 mb-6" />

        <div className="mb-4">
          <label className="block text-sm font-medium text-yellow-900 mb-1.5">닉네임</label>
          <input
            type="text"
            placeholder="닉네임을 입력해 주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-yellow-200 rounded-xl px-4 py-2.5 text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-yellow-900 mb-1.5">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-yellow-200 rounded-xl px-4 py-2.5 text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-sm text-yellow-800 mt-4">
          계정이 없으신가요?{" "}
          <span
            onClick={() => nav("/signup")}
            className="underline cursor-pointer text-yellow-700 font-medium"
          >
            회원가입
          </span>
        </p>

      </div>
    </div>
  );
}