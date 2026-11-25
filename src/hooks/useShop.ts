import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Review, Store } from "../types/store";

// URL의 shopId로 가게 + 후기 목록을 불러옴 (새로고침/공유해도 유지)
export default function useShop(shopId?: string) {
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "error">("loading");

  const load = useCallback(async () => {
    if (!shopId) return;
    setStatus("loading");
    try {
      const [shopSnap, reviewSnap] = await Promise.all([
        getDoc(doc(db, "shops", shopId)),
        getDocs(query(collection(db, "shops", shopId, "reviews"), orderBy("createdAt", "desc"))),
      ]);
      if (!shopSnap.exists()) {
        setStatus("notfound");
        return;
      }
      setStore({ id: shopSnap.id, ...(shopSnap.data() as Omit<Store, "id">) });
      setReviews(reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review));
      setStatus("ready");
    } catch (e) {
      console.error("가게 불러오기 실패", e);
      setStatus("error");
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  return { store, reviews, status, reload: load };
}
