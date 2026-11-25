import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "firebase/auth";
import type { Store } from "../types/store";

// 찜 여부 확인 + 토글 (StoreCard, Detail 공통)
export default function useSaved(store: Store | null, user: User | null) {
  const [saved, setSaved] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!user || !store) {
      setSaved(false);
      return;
    }
    let alive = true;
    getDoc(doc(db, "users", user.uid, "saved", store.id)).then((snap) => {
      if (alive) setSaved(snap.exists());
    });
    return () => {
      alive = false;
    };
  }, [user, store]);

  const toggle = async () => {
    if (!store) return;
    if (!user) {
      alert("로그인이 필요합니다.");
      nav("/login", { state: { from: `/shop/${store.id}` } });
      return;
    }
    const ref = doc(db, "users", user.uid, "saved", store.id);
    const next = !saved;
    setSaved(next); // 낙관적 업데이트
    try {
      if (next) {
        await setDoc(ref, { shopId: store.id, name: store.name, savedAt: new Date() });
      } else {
        await deleteDoc(ref);
      }
    } catch {
      setSaved(!next);
      alert("저장에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return { saved, toggle };
}
