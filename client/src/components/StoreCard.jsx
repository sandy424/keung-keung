import style from "../css/Storecard.module.css";

function StoreCard({ store, onClose }) {
  if (!store) return null;

  return (
    <div className={style.card}>
      <div className={style.header}>
        <h4>{store.name}</h4>
        <button onClick={onClose}>✕</button>
      </div>

      <p>{store.address}</p>

      <div className={style.tags}>
        {store.categories.map(cat => (
          <span key={cat}>{cat}</span>
        ))}
      </div>
    </div>
  );
}

export default StoreCard;
