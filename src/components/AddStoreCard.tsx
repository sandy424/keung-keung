import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";

const categories = ["빵", "케이크", "타르트", "구움과자", "기타"];

export default function AddStoreModal({ onClose, onAdded }: { onClose: () => void; onAdded: (store: any) => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tel, setTel] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!auth.currentUser) {
      setError("로그인 후 등록할 수 있어요.");
      return;
    }
    if (!name || !address || selectedCategories.length === 0) {
      setError("가게명, 주소, 카테고리를 입력해 주세요.");
      return;
    }

    setLoading(true);

    window.naver.maps.Service.geocode(
      { query: address },
      async (status: string, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK || !response.v2.addresses.length) {
          setError("주소를 찾을 수 없어요. 정확한 주소를 입력해 주세요.");
          setLoading(false);
          return;
        }

        const result = response.v2.addresses[0];
        const lat = parseFloat(result.y);
        const lng = parseFloat(result.x);

        try {
          const newStoreData = {
            name,
            address,
            tel: tel || "",
            category: selectedCategories,
            lat,
            lng,
            menus: [],
            price: null,
            atmosphere: null,
            avgRating: null,
            kindness: null,
            reviewCount: null,
            taste: null,
            createdBy: auth.currentUser?.uid,
            createdAt: new Date(),
          };

          const docRef = await addDoc(collection(db, "shops"), newStoreData);
          onAdded({ id: docRef.id, ...newStoreData });
          onClose();
        } catch (e) {
          setError("등록에 실패했어요. 다시 시도해 주세요.");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">가게 등록하기</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">가게명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 이앤디스튜디오"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="예: 부산광역시 수영구 수영로540번길 26"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 (선택)</label>
          <input
            type="text"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="예: 051-123-4567"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 (중복 선택 가능)</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  selectedCategories.includes(cat)
                    ? "bg-rose-400 text-white border-rose-400"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}