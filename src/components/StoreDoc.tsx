import type { Store } from "../types/store";

export default function StoreDoc({ store }: { store: Store }) {
  const rows = [
    { icon: "/Address.svg", label: "주소", value: store.address },
    { icon: "/Tel.svg", label: "연락처", value: store.tel },
    { icon: null, label: "영업시간", value: store.hours },
  ];

  return (
    <div className="space-y-4 pt-2">
      {store.description && <p className="text-gray-600">{store.description}</p>}
      {rows.map(({ icon, label, value }) => (
        <div key={label} className="flex items-start">
          {icon ? <img src={icon} alt="" width={20} height={20} /> : <span className="w-5 text-center">🕐</span>}
          <span className="w-20 shrink-0 pl-2 text-[15px] font-semibold text-gray-600">{label}</span>
          <span className="text-gray-900">{value || "정보 없음"}</span>
        </div>
      ))}
    </div>
  );
}
