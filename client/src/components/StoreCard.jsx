import style from "../css/Storecard.module.css";
import RateStar from "../assets/icons/RateStar.svg?react";

function StoreCard({ store, onClose }) {
  if (!store) return null;

  return (
    <div className={style.card}>
      <div className={style.header}>
        <p>{store.category}</p>
        <h2>{store.name}</h2>
        <div className={style.star}>
          <RateStar width={28} height={28}/>
          <span>{store.rating}</span>
        </div>
      </div>
      <button className={style.closeBtn} onClick={onClose}>✕</button>
    </div>
  );
}

export default StoreCard;
