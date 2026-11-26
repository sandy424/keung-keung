import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Store } from "../types/store";

export type PlaceInfo = {
  placeId: string | null;
  phone: string | null;
  weekdayText: string[];
  openNow: boolean | null;
};

type State = { status: "idle" | "loading" | "ready" | "unavailable"; info: PlaceInfo | null };

// 같은 탭에서 같은 가게를 다시 열 때 API를 또 부르지 않도록 메모리에만 잠깐 보관
// (Google 약관상 전화번호·영업시간은 저장하지 않으므로 새로고침하면 사라짐)
const memory = new Map<string, PlaceInfo>();

// Google Places로 가게의 전화번호·영업시간을 불러옴 (/api/place-info)
export default function usePlaceInfo(store: Store | null): State {
  const [state, setState] = useState<State>({ status: "idle", info: null });

  useEffect(() => {
    if (!store) return;
    const cached = memory.get(store.id);
    if (cached) {
      setState({ status: "ready", info: cached });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading", info: null });

    const params = new URLSearchParams(
      store.googlePlaceId
        ? { placeId: store.googlePlaceId }
        : { name: store.name, address: store.address ?? "", lat: String(store.lat ?? ""), lng: String(store.lng ?? "") }
    );

    fetch(`/api/place-info?${params}`, { signal: controller.signal })
      .then(async (res) => {
        // 404: 로컬 vite 개발 서버(함수 없음), 503: 키 미설정, 그 외: 한도 초과 등
        if (!res.ok) {
          setState({ status: "unavailable", info: null });
          return;
        }
        const info = (await res.json()) as PlaceInfo;
        memory.set(store.id, info);
        setState({ status: "ready", info });

        // 처음 찾은 placeId는 가게에 저장해 다음부터 검색 없이 바로 조회 (실패해도 무시)
        if (info.placeId && !store.googlePlaceId) {
          updateDoc(doc(db, "shops", store.id), { googlePlaceId: info.placeId }).catch(() => {});
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "unavailable", info: null });
      });

    return () => controller.abort();
  }, [store]);

  return state;
}
