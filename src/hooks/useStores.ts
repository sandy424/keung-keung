import { useEffect, useSyncExternalStore } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Store } from "../types/store";
import { CURRENT_REGION, regionOf } from "../config/region";

// 가게 목록을 앱 전체에서 한 번만 불러와 공유 (헤더 검색, 지도, 핫플레이스)
type State = { stores: Store[]; status: "idle" | "loading" | "ready" | "error" };

let state: State = { stores: [], status: "idle" };
const listeners = new Set<() => void>();

const setState = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export async function loadStores(force = false) {
  if (!force && (state.status === "loading" || state.status === "ready")) return;
  setState({ status: "loading" });
  try {
    const snap = await getDocs(collection(db, "shops"));
    const stores = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Store, "id">) }))
      .filter((s) => regionOf(s) === CURRENT_REGION.id);
    setState({ stores, status: "ready" });
  } catch (e) {
    console.error("가게 목록 불러오기 실패", e);
    setState({ status: "error" });
  }
}

// 새로 추천한 가게를 바로 반영
export function addStoreLocal(store: Store) {
  setState({ stores: [...state.stores, store] });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export default function useStores() {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    loadStores();
  }, []);
  return snapshot;
}
