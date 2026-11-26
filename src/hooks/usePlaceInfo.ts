import { useEffect, useState } from "react";
import type { Store } from "../types/store";

export type PlaceInfo = {
  phone: string | null;
  placeUrl: string | null;
};

type State = { status: "idle" | "loading" | "ready" | "unavailable"; info: PlaceInfo | null };

// 같은 탭에서 같은 가게를 다시 열 때 API를 또 부르지 않도록 메모리에만 잠깐 보관
// (카카오 로컬 API 정책상 결과를 저장하지 않으므로 새로고침하면 사라짐)
const memory = new Map<string, PlaceInfo>();

// 카카오 로컬 API로 가게 전화번호를 불러옴 (/api/place-info)
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

    const params = new URLSearchParams({ name: store.name });
    if (Number.isFinite(store.lat) && Number.isFinite(store.lng)) {
      params.set("lat", String(store.lat));
      params.set("lng", String(store.lng));
    }

    fetch(`/api/place-info?${params}`, { signal: controller.signal })
      .then(async (res) => {
        // 404: 로컬 vite 개발 서버(함수 없음), 503: 키 미설정, 그 외: 일시 오류
        if (!res.ok) {
          setState({ status: "unavailable", info: null });
          return;
        }
        const info = (await res.json()) as PlaceInfo;
        memory.set(store.id, info);
        setState({ status: "ready", info });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "unavailable", info: null });
      });

    return () => controller.abort();
  }, [store]);

  return state;
}
