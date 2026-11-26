import type { Store } from "../types/store";
import { naverMapUrl } from "../utils/naver";

export default function StoreDoc({ store }: { store: Store }) {
  const rows = [
    { icon: "/Address.svg", label: "주소", value: store.address },
    { icon: "/Tel.svg", label: "연락처", value: store.tel },
    { icon: null, label: "영업시간", value: store.hours },
  ];

  return (
    <div className="space-y-4 pt-2">
      {store.description && <p className="text-amber-900/70">{store.description}</p>}
      {rows.map(({ icon, label, value }) => (
        <div key={label} className="flex items-start">
          {icon ? <img src={icon} alt="" width={20} height={20} className="opacity-60" /> : <span className="w-5" />}
          <span className="w-20 shrink-0 pl-2 text-sm font-medium text-amber-900/50">{label}</span>
          <span className="text-amber-950">{value || "정보 없음"}</span>
        </div>
      ))}
      <a href={naverMapUrl(store)} target="_blank" rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-amber-900/15 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-50">
        <span aria-hidden="true">🗺️</span>
        네이버 지도에서 영업시간·메뉴·사진 보기 ↗
      </a>
    </div>
  );
}
