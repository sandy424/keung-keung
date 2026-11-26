import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/", icon: "/Logo.svg", label: "지도", size: 30 },
  { to: "/hotplace", icon: "/Fire.svg", label: "핫플레이스", size: 30 },
  { to: "/saved", icon: "/Heart.svg", label: "저장", size: 26 },
  { to: "/mypage", icon: "/Profile.svg", label: "마이페이지", size: 30 },
];

export default function Bottombar() {
  return (
    <nav className="absolute inset-x-4 bottom-5 z-10 mx-auto flex max-w-125 justify-around rounded-2xl border border-amber-900/10 bg-white/95 px-4 py-3 shadow-lg shadow-amber-950/10 backdrop-blur sm:inset-x-20">
      {ITEMS.map(({ to, icon, label, size }) => (
        <NavLink key={to} to={to} end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs transition ${isActive ? "font-bold text-amber-950" : "text-amber-900/40 hover:text-amber-950 [&>img]:opacity-50"}`
          }>
          <img src={icon} width={size} height={size} alt="" className="h-8 object-contain" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
