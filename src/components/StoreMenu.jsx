import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

export default function StoreMenu({ shopId }) {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    if (!shopId) return;

    const fetchMenu = async () => {
      const datas = await getDoc(doc(db, "shops", shopId));
      if (datas.exists()) {
        const menuList = (datas.data().menus ?? []).map((m) => ({
          name: m.name,
          price: m.price,
        }));
        setMenu(menuList);
      }
    };
    fetchMenu();
  }, [shopId]);

  return (
    <div className="pt-20">
      <h2 className="text-2xl font-bold tracking-widest mb-10">
        메뉴
      </h2>

      <ul className="flex flex-col gap-6">
        {menu.map((m, i) => (
          <li key={i} className="flex items-baseline gap-4">
            <span className="text-lg font-semibold whitespace-nowrap">
              {m.name}
            </span>
            <span className="flex-1 border-b border-dotted border-gray-300" />
            <span className="text-base text-gray-600 whitespace-nowrap">
              {m.price.toLocaleString()}원
            </span>
          </li>
        ))}
      </ul>

      {menu.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          메뉴 준비 중이에요
        </p>
      )}
    </div>
  );
}