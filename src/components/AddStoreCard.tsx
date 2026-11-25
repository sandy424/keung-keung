import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { CURRENT_REGION, isInRegion } from "../config/region";
import useAuth from "../hooks/useAuth";
import type { Menu, Store } from "../types/store";
import { normalize, searchStores } from "../utils/search";
import useStores from "../hooks/useStores";

const CATEGORIES = ["빵", "케이크", "타르트", "구움과자", "기타"];
const MAX_MENUS = 5;
const MAX_TAGS = 8;

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none";

type Props = { onClose: () => void; onAdded: (store: Store) => void };

// 내가 추천하는 디저트 가게를 등록하면 지도에 핀으로 표시됨
export default function AddStoreCard({ onClose, onAdded }: Props) {
  const { nickname } = useAuth();
  const { stores } = useStores();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tel, setTel] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [menus, setMenus] = useState<{ name: string; price: string }[]>([{ name: "", price: "" }]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 등록된 가게인지 이름으로 미리 알려줌
  const duplicate = name.trim()
    ? searchStores(stores, name).find((h) => h.field === "이름" && normalize(h.store.name) === normalize(name))
    : undefined;

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#/, "").trim();
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, tag.slice(0, 15)]);
  };

  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const updateMenu = (i: number, key: "name" | "price", value: string) =>
    setMenus((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));

  const handleSubmit = async () => {
    setError("");

    if (!auth.currentUser) {
      setError("로그인 후 추천할 수 있어요.");
      return;
    }
    if (!name.trim() || !address.trim() || selectedCategories.length === 0) {
      setError("가게명, 주소, 카테고리를 입력해 주세요.");
      return;
    }
    if (duplicate) {
      setError("이미 지도에 있는 가게예요. 후기로 추천해 주세요!");
      return;
    }

    // 입력 중인 태그도 반영
    const finalTags = tagInput.trim() ? Array.from(new Set([...tags, tagInput.replace(/^#/, "").trim()])) : tags;
    const finalMenus: Menu[] = menus
      .filter((m) => m.name.trim())
      .map((m) => ({ name: m.name.trim(), price: m.price ? Number(m.price.replace(/[^0-9]/g, "")) || null : null }));

    setLoading(true);

    window.naver.maps.Service.geocode({ query: address }, async (status: string, response: any) => {
      if (status !== window.naver.maps.Service.Status.OK || !response.v2.addresses.length) {
        setError("주소를 찾을 수 없어요. 정확한 주소를 입력해 주세요.");
        setLoading(false);
        return;
      }

      const result = response.v2.addresses[0];
      const resolved: string = result.roadAddress || result.jibunAddress || "";

      // 현재 서비스 지역(부산) 밖의 주소는 등록 불가
      if (!isInRegion(resolved)) {
        setError(`지금은 ${CURRENT_REGION.name} 지역 가게만 추천할 수 있어요.`);
        setLoading(false);
        return;
      }

      try {
        const newStoreData = {
          name: name.trim(),
          address: resolved || address.trim(),
          tel: tel.trim(),
          hours: hours.trim(),
          description: description.trim(),
          category: selectedCategories,
          tags: finalTags,
          menus: finalMenus,
          region: CURRENT_REGION.id,
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
          price: null,
          atmosphere: null,
          avgRating: null,
          kindness: null,
          reviewCount: 0,
          taste: null,
          createdBy: auth.currentUser?.uid,
          recommender: nickname ?? "익명",
          createdAt: new Date(),
        };

        const docRef = await addDoc(collection(db, "shops"), newStoreData);
        onAdded({ id: docRef.id, ...newStoreData });
        onClose();
      } catch {
        setError("등록에 실패했어요. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900">🍰 내가 아는 맛집 추천하기</h2>
        <p className="mb-5 mt-1 text-xs text-gray-400">
          추천한 가게는 지도에 바로 표시돼요 · 현재 {CURRENT_REGION.name} 지역만 가능해요
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">가게명 *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 이앤디스튜디오" className={inputCls} />
        {duplicate && <p className="mt-1 text-xs text-rose-500">이미 등록된 가게예요: {duplicate.store.name}</p>}

        <label className="mb-1 mt-3 block text-sm font-medium text-gray-700">주소 *</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="예: 부산광역시 수영구 수영로540번길 26" className={inputCls} />

        <label className="mb-2 mt-3 block text-sm font-medium text-gray-700">카테고리 * (중복 선택)</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => toggleCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selectedCategories.includes(cat) ? "border-rose-400 bg-rose-400 text-white" : "border-gray-200 bg-white text-gray-600"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* 추천 메뉴 */}
        <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">추천 메뉴</label>
        <div className="space-y-2">
          {menus.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input value={m.name} onChange={(e) => updateMenu(i, "name", e.target.value)} placeholder="메뉴 이름 (예: 휘낭시에)" className={`${inputCls} flex-[2]`} />
              <input value={m.price} inputMode="numeric" onChange={(e) => updateMenu(i, "price", e.target.value)} placeholder="가격" className={`${inputCls} flex-1`} />
              {menus.length > 1 && (
                <button type="button" onClick={() => setMenus((prev) => prev.filter((_, idx) => idx !== i))}
                  className="px-1 text-gray-400 hover:text-gray-700" aria-label="메뉴 삭제">✕</button>
              )}
            </div>
          ))}
        </div>
        {menus.length < MAX_MENUS && (
          <button type="button" onClick={() => setMenus((prev) => [...prev, { name: "", price: "" }])}
            className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700">+ 메뉴 추가</button>
        )}

        {/* 태그 */}
        <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">태그 <span className="font-normal text-gray-400">(Enter로 추가)</span></label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-amber-400 focus-within:bg-white">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm text-amber-800">
              #{t}
              <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} aria-label={`${t} 태그 삭제`}>✕</button>
            </span>
          ))}
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey}
            onBlur={() => { addTag(tagInput); setTagInput(""); }}
            placeholder={tags.length ? "" : "#데이트 #오션뷰 #노키즈존"}
            className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none" />
        </div>

        <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">추천 한마디</label>
        <input value={description} maxLength={60} onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 바삭한 휘낭시에가 맛있는 광안리 카페" className={inputCls} />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">전화번호</label>
            <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="051-123-4567" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">영업시간</label>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="11:00 - 21:00" className={inputCls} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-600">취소</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-[2] rounded-xl bg-rose-400 py-3 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-50">
            {loading ? "등록 중..." : "추천하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
