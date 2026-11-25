import type { Menu } from "../types/store";

export default function StoreMenu({ menus = [] }: { menus?: Menu[] }) {
  if (menus.length === 0) {
    return <p className="py-10 text-center text-gray-400">메뉴 준비 중이에요</p>;
  }
  return (
    <ul className="flex flex-col gap-5">
      {menus.map((m, i) => (
        <li key={`${m.name}-${i}`} className="flex items-baseline gap-4">
          <span className="whitespace-nowrap text-lg font-semibold">{m.name}</span>
          <span className="flex-1 border-b border-dotted border-gray-300" />
          <span className="whitespace-nowrap text-gray-600">{Number(m.price).toLocaleString()}원</span>
        </li>
      ))}
    </ul>
  );
}
