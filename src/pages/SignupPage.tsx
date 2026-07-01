import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function Signup() {

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 닉네임 중복 체크 관련 state 추가
    const [nicknameStatus, setNicknameStatus] = useState<"idle" | "checking" | "available" | "duplicate">("idle");

    const nav = useNavigate();

    // 닉네임 실시간 중복 체크 (디바운싱)
    useEffect(() => {
        if (!nickname) {
            setNicknameStatus("idle");
            return;
        }

        setNicknameStatus("checking");

        const timer = setTimeout(async () => {
            try {
                const q = query(collection(db, "users"), where("nickname", "==", nickname));
                const snapshot = await getDocs(q);
                setNicknameStatus(snapshot.empty ? "available" : "duplicate");
            } catch (e) {
                setNicknameStatus("idle");
            }
        }, 500); // 500ms 디바운싱

        return () => clearTimeout(timer);
    }, [nickname]);

    const handleSignup = async () => {
    setError("");

    if (!email || !nickname || !password || !confirmPassword) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }
    if (nicknameStatus === "duplicate") {
      setError("이미 사용 중인 닉네임입니다.");
      return;
    }
    if (nicknameStatus === "checking") {
      setError("닉네임 중복 확인 중입니다. 잠시만 기다려 주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);

      // 최종 제출 시에도 한 번 더 확인 (레이스 컨디션 방지)
      const q = query(collection(db, "users"), where("nickname", "==", nickname));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError("이미 사용 중인 닉네임입니다.");
        setLoading(false);
        return;
      }

      const userInitail = await createUserWithEmailAndPassword(auth, email, password);
      const user = userInitail.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        nickname: nickname,
        createAt: new Date(),
      });
      
      nav("/");
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else if (e.code === "auth/invalid-email") {
        setError("이메일 형식이 올바르지 않습니다.");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해 주세요.");
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
          <label className="block text-sm font-medium text-yellow-900 mb-1.5">이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-yellow-200 rounded-xl px-4 py-2.5 text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-yellow-900 mb-1.5">닉네임</label>
          <input
            type="text"
            placeholder="사용하실 닉네임을 입력해 주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-yellow-200 rounded-xl px-4 py-2.5 text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
          />
          {/* 닉네임 상태 실시간 표시 */}
          {nicknameStatus === "checking" && (
            <p className="text-xs text-gray-400 mt-1.5">확인 중...</p>
          )}
          {nicknameStatus === "available" && (
            <p className="text-xs text-green-600 mt-1.5">사용 가능한 닉네임이에요</p>
          )}
          {nicknameStatus === "duplicate" && (
            <p className="text-xs text-red-500 mt-1.5">이미 사용 중인 닉네임이에요</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-yellow-900 mb-1.5">비밀번호</label>
          <input
            type="password"
            placeholder="6자 이상 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-yellow-200 rounded-xl px-4 py-2.5 text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-yellow-900 mb-1.5">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력해 주세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-yellow-200 rounded-xl px-4 py-2.5 text-sm bg-yellow-50 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading || nicknameStatus === "checking" || nicknameStatus === "duplicate"}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? "가입 중..." : "가입하기"}
        </button>

        <p className="text-center text-sm text-yellow-800 mt-4">
          이미 계정이 있으신가요?{" "}
          <span
            onClick={() => nav("/login")}
            className="underline cursor-pointer text-yellow-700 font-medium"
          >
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}