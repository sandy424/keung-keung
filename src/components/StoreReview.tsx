import type { Review } from "../types/store";
import { formatDate, reviewAvg } from "../utils/rating";
import StarIcon from "./StarIcon";

// 후기 리스트 - 별점, 후기글, 작성일
export default function StoreReview({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="py-10 text-center text-gray-400">아직 후기가 없어요. 첫 후기를 남겨보세요!</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {reviews.map((r) => {
        const avg = reviewAvg(r.rating);
        return (
          <li key={r.id} className="py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{r.nickname ?? "익명"}</span>
                {avg !== null && (
                  <span className="flex items-center gap-0.5 text-gray-700">
                    <StarIcon size={14} /> {avg.toFixed(1)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-gray-700">{r.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
