import style from "../css/Storecard.module.css";

function StoreCard({ store, onClose }) {
  if (!store) return null;

  return (
    <div className={style.card}>
      <div className={style.header}>
        <p>{store.category}</p>
        <h2>{store.name}</h2>
      </div>
      <button className={style.closeBtn} onClick={onClose}>✕</button>
    </div>
  );
}

export default StoreCard;
