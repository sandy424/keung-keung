import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import Modal from "./Modal";

export default function StoreReview({shopId, onCountChange, onAvgChange}) {

  const [review, setReview] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submit, setSubmit] = useState(false);
  const [rating, setRating] = useState({
    taste: 0,
    mood: 0,
    kind: 0,
    price: 0,
  });

  // 별점 평균 계산 (리뷰 1개 기준)
  const getAvg = (rating) => {
    if (!rating) return null;
    const values = Object.values(rating);
    const sum = values.reduce((acc, cur) => acc + cur, 0);
    return (sum/values.length).toFixed(1);
  }

  // 리뷰 목록으로 전체 평균 + 개수 계산
  const calcSummary = (list) => {
    const rated = list.filter((r) => r.rating);
    if (rated.length === 0) {
      return { avg: null, count: list.length };
    }
    const total = rated.reduce((acc, r) => acc + Number(getAvg(r.rating)), 0);
    return { avg: (total / rated.length).toFixed(1), count: list.length };
  }

  // 리뷰 불러오기
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

    const { avg, count } = calcSummary(list);
    onCountChange?.(count);
    onAvgChange?.(avg);
    return { avg, count };
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
        rating,
        createdAt: serverTimestamp(),
      });
      setText("");
      setRating({taste: 0, mood: 0, kind: 0, price: 0});
      setOpen(false);

      const { avg, count } = await fetchReview(); // 리뷰 목록 새로고침 + 최신 요약 받기

      // shops 문서에도 avgRating, reviewCount 반영 (지도 팝업 등에서 재사용)
      await updateDoc(doc(db, "shops", shopId), {
        avgRating: avg,
        reviewCount: count,
      });

    } catch (e) {
      console.log("리뷰 저장 실패: ", e);
      alert("리뷰 저장에 실패했어요. 다시 시도해주세요");
    } finally {
      setSubmit(false);
    }
  }

  const handleRating = (key, v) => {
    setRating((prev) => ({...prev, [key]: v}));
  }


  return(
    <div className='pt-20'>

      <div className="flex gap-6 items-center text-2xl font-bold tracking-widest mb-8">
        <h2>리뷰</h2>
        <span>{review.length}</span>
      </div>

      <ul>
        {review.map((r) => {
          const avg = getAvg(r.rating);
          return (
            <li key={r.id} className="border-b border-gray-200 py-4 flex justify-between px-6">
              <div className="flex items-center gap-2">
                <img src="/RateStar.svg" width={20} height={20} alt="별점" />
                {avg && <span className="font-semibold">{avg}</span>}
                <p>{r.text}</p>
              </div>
              <span>{r.createdAt?.toDate?.().toLocaleDateString() ?? ""}</span>
            </li>
          );
        })}
      </ul>
      
      <button className="cursor-pointer mt-4 rounded-3xl bg-amber-500 px-5 py-3 text-white text-lg text-" onClick={() => setOpen(true)}>
        리뷰쓰기
      </button>
      
      {/* 리뷰 작성 모달 */}
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-bold mb-8">리뷰 작성</h2>

        {/* 별점 매기기 */}
        <div className="flex flex-col gap-3 mb-10 px-10">
          {[
            {key: "taste", label: "맛"},
            {key: "mood", label: "분위기"},
            { key: "kind", label: "친절" },
            { key: "price", label: "가격" },
          ].map(({key, label}) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-base">{label}</span>

              {/* 별 5개 */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => {
                  const score = n <= rating[key];
                  return(
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleRating(key, n)}
                      className="cursor-pointer">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={score ? "#EF9F27" : "none"}
                        stroke={score ? "#EF9F27" : "#d1d5db"}
                        strokeWidth="2"
                      >
                        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" />
                      </svg>  
                    </button>
                  )

                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* 리뷰 작성박스 */}
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