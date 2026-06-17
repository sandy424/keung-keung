import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

export default function StoreMenu({shopId}) {

  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchMenu = async() => {
      const datas = await getDoc(doc(db, "shops", shopId));
      if (datas.exists()) {
        const menuList = (datas.data().menus ?? []).map((m) => ({
          name: m.name,
          price: m.price,
        }));
        setMenu(menuList);
      }
    }
    fetchMenu();
  }, [shopId]);

  
  return(
    <div>
      <ul>
        {menu.map((m, i) => (
          <li key={i}>{m.name} <br /> {m.price}원</li>
        ))}
      </ul>
    </div>
  )
}