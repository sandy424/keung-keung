import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function storeReview({shopId}) {

  const [review, setReview] = useState([]);

  useEffect(() => {
    if (!shopId) return;

    const fetchReview = async() => {
      const q = query(
        collection(db, "shops", shopId, "reviews"),
        orderBy("createdAt", "desc")
      );
      const getReview = await getDoc(q);
      const list = getReview.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReview(list);
    }
    fetchReview();
  }, [shopId]);

  return(
    <div className='pt-20'>
      <div className="flex gap-6">
        <h2 className="text-2xl font-bold tracking-widest mb-8">
          리뷰
        </h2>
        <span>{shopId?.reviewCounts}</span>
      </div>

      <ul>
        {review.map((r) => (
          <li key={r.id} className="border-b border-gray-100 pb-3">
            <p>{r.text}</p>
            <span>
              {r.createdAt?.toDate?.().toLocaleDateString() ?? ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}