import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// 로그인 사용자 + Firestore 닉네임을 함께 구독
export default function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        try {
          const snap = await getDoc(doc(db, "users", current.uid));
          setNickname(snap.exists() ? snap.data().nickname ?? null : null);
        } catch {
          setNickname(null);
        }
      } else {
        setNickname(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, nickname, loading };
}
