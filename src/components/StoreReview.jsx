import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import Modal from "./Modal";

export default function StoreReview({shopId, onCountChange}) {

  const [review, setReview] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submit, setSubmit] = useState(false);
  const [rating, setRating] = useState({
    tast: 0,
    mode: 0,
    kind: 0,
    price: 0,
  });
    

  const fetchReview = async() => {
    if (!shopId) return;
    const q = query(
      collection(db, "shops", shopId, "reviews"),
      orderBy("createdAt", "desc")
    );
    const getReview = await getDocs(q);
    const list = getReview.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReview(list);
    onCountChange?.(list.length);
  }

  useEffect(() => {
    fetchReview();
  }, [shopId]);

  // 리뷰 등록
  const handleSubmit = async() => {
    if(!text.trim()) return;
    if(submit) return;

    setSubmit(true);
    try{
      await addDoc(collection(db, "shops", shopId, "reviews"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      setOpen(false);
      await fetchReview(); // 리뷰 목록 새로고침
      
    } catch (e) {
      console.log("리뷰 저장 실패: ", e);
      alert("리뷰 저장에 실패했어요. 다시 시도해주세요");
    } finally {
      setSubmit(false);
    }
  }

  return(
    <div className='pt-20'>

      <div className="flex gap-6 items-center text-2xl font-bold tracking-widest mb-8">
        <h2>리뷰</h2>
        <span>{review.length}</span>
      </div>

      <ul>
        {review.map((r) => (
          <li key={r.id} className="border-b border-gray-200 pb-4 flex justify-between px-6">
            <p>{r.text}</p>
            <span>
              {r.createdAt?.toDate?.().toLocaleDateString() ?? ""}
            </span>
          </li>
        ))}
      </ul>
      
      <button className="cursor-pointer mt-4 rounded-3xl bg-amber-500 px-5 py-3 text-white text-lg text-" onClick={() => setOpen(true)}>
        리뷰쓰기
      </button>
      
      {/* 리뷰 작성 모달 */}
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-bold mb-8">리뷰 작성</h2>

        {/* 별점 매기기 */}
        <div className="flex flex-col gap-3 mb-10">
          {[
            {key: "tast", label: "맛"},
            {key: "mode", label: "분위기"},
            { key: "kind", label: "친절" },
            { key: "price", label: "가격" },
          ].map(({key, label}) => (
            <div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder="리뷰를 작성해주세요"
          className="w-full h-32 resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-300" />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpen(false)}
            className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200 cursor-pointer">
            취소
          </button>
          <button onClick={handleSubmit} disabled={submit || !text.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-600 cursor-pointer">
            {submit ? "등록 중.." : "등록"}
          </button>
        </div>
      </Modal>
    </div>
  )
}