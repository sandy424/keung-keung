import { useEffect, useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { CURRENT_REGION, isInRegion } from "../config/region";
import useAuth from "../hooks/useAuth";
import type { Menu, Store } from "../types/store";
import { normalize, searchStores } from "../utils/search";
import useStores from "../hooks/useStores";
import { guessCategories } from "../utils/naver";
import { MAX_ORIGINAL_MB, isImage, uploadMenuPhoto } from "../utils/image";

const CATEGORIES = ["빵", "케이크", "타르트", "구움과자", "기타"];
const MAX_MENUS = 5;
const MAX_TAGS = 8;

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none";

type Props = { onClose: () => void; onAdded: (store: Store) => void };

type MenuDraft = { name: string; price: string; file: File | null; preview: string | null };

type Place = {
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  lat: number | null;
  lng: number | null;
};

type Located = { address: string; lat: number; lng: number };

// 네이버 지도 지오코더로 주소 → 좌표 (실패 시 null)
function geocode(query: string): Promise<Located | null> {
  return new Promise((resolve) => {
    const service = window.naver?.maps?.Service;
    if (!service?.geocode) {
      console.error("네이버 지도 지오코더를 불러오지 못했어요. Maps 인증과 Geocoding 사용 설정을 확인하세요.");
      resolve(null);
      return;
    }
    const timer = setTimeout(() => resolve(null), 8000);
    service.geocode({ query }, (status: string, response: any) => {
      clearTimeout(timer);
      const item = response?.v2?.addresses?.[0];
      if (status !== service.Status.OK || !item) {
        console.error("지오코딩 실패", { query, status, meta: response?.v2?.meta, error: response?.v2?.errorMessage });
        resolve(null);
        return;
      }
      resolve({ address: item.roadAddress || item.jibunAddress || query, lat: parseFloat(item.y), lng: parseFloat(item.x) });
    });
  });
}

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
  const [menus, setMenus] = useState<MenuDraft[]>([{ name: "", price: "", file: null, preview: null }]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 네이버 장소 검색 (가게 이름 입력 → 실제 가게 선택)
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeAvailable, setPlaceAvailable] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedPlace, setPickedPlace] = useState<Place | null>(null);

  useEffect(() => {
    const q = name.trim();
    if (!placeAvailable || q.length < 2 || q === picked) {
      setPlaces([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPlaceLoading(true);
      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (res.status === 404 || res.status === 503) {
          setPlaceAvailable(false); // 로컬 개발(vite) 또는 키 미설정 → 직접 입력
          return;
        }
        const data = res.ok ? await res.json() : { places: [] };
        setPlaces(data.places ?? []);
        setPlaceOpen(true);
      } catch {
        /* 입력이 바뀌어 취소된 요청 */
      } finally {
        setPlaceLoading(false);
      }
    }, 350); // 디바운스
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, picked, placeAvailable]);

  const pickPlace = (place: Place) => {
    setPicked(place.name);
    setPickedPlace(place);
    setName(place.name);
    setAddress(place.roadAddress || place.address);
    if (place.telephone) setTel(place.telephone);
    const guessed = guessCategories(place.category);
    if (guessed.length) setSelectedCategories((prev) => Array.from(new Set([...prev, ...guessed])));
    setPlaceOpen(false);
    setPlaces([]);
  };

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

  // 메뉴 사진 선택 (미리보기는 objectURL)
  const setMenuPhoto = (i: number, file: File | null) => {
    if (file && !isImage(file)) {
      setError("JPG, PNG, WEBP 같은 이미지 파일만 올릴 수 있어요.");
      return;
    }
    if (file && file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
      setError(`사진은 ${MAX_ORIGINAL_MB}MB 이하로 올려주세요.`);
      return;
    }
    setError("");
    setMenus((prev) =>
      prev.map((m, idx) => {
        if (idx !== i) return m;
        if (m.preview) URL.revokeObjectURL(m.preview);
        return { ...m, file, preview: file ? URL.createObjectURL(file) : null };
      })
    );
  };

  // 모달이 닫힐 때 미리보기 URL 정리
  useEffect(() => () => menus.forEach((m) => m.preview && URL.revokeObjectURL(m.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [uploadMsg, setUploadMsg] = useState("");

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
    const menuDrafts = menus.filter((m) => m.name.trim());

    setLoading(true);

    // 1) 목록에서 고른 가게이고 주소를 고치지 않았다면 검색 결과 좌표 사용
    // 2) 아니면 지오코딩 (도로명 → 지번 주소 순으로 시도)
    const placeAddress = pickedPlace ? pickedPlace.roadAddress || pickedPlace.address : "";
    let located: Located | null =
      pickedPlace && address.trim() === placeAddress && pickedPlace.lat !== null && pickedPlace.lng !== null
        ? { address: placeAddress, lat: pickedPlace.lat, lng: pickedPlace.lng }
        : await geocode(address.trim());
    if (!located && pickedPlace?.address && pickedPlace.address !== address.trim()) {
      located = await geocode(pickedPlace.address);
    }

    if (!located) {
      setError("주소를 찾을 수 없어요. 가게 이름으로 검색해서 목록에서 골라보거나, 도로명 주소를 정확히 입력해 주세요.");
      setLoading(false);
      return;
    }

    // 현재 서비스 지역(부산) 밖의 주소는 등록 불가
    if (!isInRegion(located.address)) {
      setError(`지금은 ${CURRENT_REGION.name} 지역 가게만 추천할 수 있어요.`);
      setLoading(false);
      return;
    }

    try {
      // 문서 id를 먼저 만들어 사진 경로(shops/{id}/menus/...)에 사용
      const shopRef = doc(collection(db, "shops"));

      const photoCount = menuDrafts.filter((m) => m.file).length;
      if (photoCount) setUploadMsg(`메뉴 사진 ${photoCount}장 올리는 중...`);
      const finalMenus: Menu[] = await Promise.all(
        menuDrafts.map(async (m, i) => ({
          name: m.name.trim(),
          price: m.price ? Number(m.price.replace(/[^0-9]/g, "")) || null : null,
          photo: m.file ? await uploadMenuPhoto(shopRef.id, i, m.file) : null,
        }))
      );
      setUploadMsg("");

      const newStoreData = {
        name: name.trim(),
        address: located.address,
        tel: tel.trim(),
        hours: hours.trim(),
        description: description.trim(),
        category: selectedCategories,
        tags: finalTags,
        menus: finalMenus,
        region: CURRENT_REGION.id,
        lat: located.lat,
        lng: located.lng,
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

      await setDoc(shopRef, newStoreData);
      onAdded({ id: shopRef.id, ...newStoreData });
      onClose();
    } catch (e) {
      console.error("가게 등록 실패", e);
      setUploadMsg("");
      setError("등록에 실패했어요. 사진이 있다면 사진 없이 다시 시도해 보세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900">🍰 내가 아는 맛집 추천하기</h2>
        <p className="mb-5 mt-1 text-xs text-gray-400">
          추천한 가게는 지도에 바로 표시돼요 · 현재 {CURRENT_REGION.name} 지역만 가능해요
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">가게명 *</label>
        <div className="relative">
          <input value={name} onChange={(e) => { setName(e.target.value); setPicked(null); setPickedPlace(null); }}
            onFocus={() => places.length && setPlaceOpen(true)}
            onBlur={() => setTimeout(() => setPlaceOpen(false), 150)}
            placeholder={placeAvailable ? "가게 이름을 검색해 보세요" : "예: 이앤디스튜디오"} className={inputCls}
            role="combobox" aria-expanded={placeOpen} aria-autocomplete="list" />
          {placeLoading && <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />}
          {placeOpen && name.trim().length >= 2 && !placeLoading && (
            <ul role="listbox" className="absolute inset-x-0 top-[calc(100%+4px)] z-10 overflow-hidden rounded-xl border border-amber-100 bg-white shadow-lg">
              {places.length === 0 ? (
                <li className="px-4 py-3 text-xs text-gray-400">{CURRENT_REGION.name}에서 찾은 가게가 없어요. 직접 입력해 주세요.</li>
              ) : (
                places.map((p) => (
                  <li key={`${p.name}-${p.roadAddress}`}>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pickPlace(p)}
                      className="block w-full px-4 py-2.5 text-left hover:bg-amber-50">
                      <span className="block text-sm font-semibold text-gray-900">{p.name}</span>
                      <span className="block truncate text-xs text-gray-500">{p.roadAddress || p.address}</span>
                      {p.category && <span className="block truncate text-[11px] text-gray-400">{p.category}</span>}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {picked && <p className="mt-1 text-xs text-emerald-600">✓ 네이버에서 찾은 가게 정보로 주소를 채웠어요</p>}
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
        <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">추천 메뉴 <span className="font-normal text-gray-400">(📷 눌러 사진 추가)</span></label>
        <div className="space-y-2">
          {menus.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* 메뉴 사진 */}
              <div className="relative h-11 w-11 shrink-0">
                <label className="flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-amber-300 bg-amber-50 text-lg text-amber-500 hover:bg-amber-100"
                  title="메뉴 사진 추가">
                  {m.preview ? <img src={m.preview} alt={`${m.name || "메뉴"} 사진`} className="h-full w-full object-cover" /> : <span aria-hidden="true">📷</span>}
                  <input type="file" accept="image/*" className="sr-only" aria-label={`${i + 1}번 메뉴 사진`}
                    onChange={(e) => { setMenuPhoto(i, e.target.files?.[0] ?? null); e.target.value = ""; }} />
                </label>
                {m.preview && (
                  <button type="button" onClick={() => setMenuPhoto(i, null)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-[10px] text-white" aria-label="사진 삭제">✕</button>
                )}
              </div>
              <input value={m.name} onChange={(e) => updateMenu(i, "name", e.target.value)} placeholder="메뉴 이름 (예: 휘낭시에)" className={`${inputCls} min-w-0 flex-[2]`} />
              <input value={m.price} inputMode="numeric" onChange={(e) => updateMenu(i, "price", e.target.value)} placeholder="가격" className={`${inputCls} min-w-0 flex-1`} />
              {menus.length > 1 && (
                <button type="button" onClick={() => { if (m.preview) URL.revokeObjectURL(m.preview); setMenus((prev) => prev.filter((_, idx) => idx !== i)); }}
                  className="px-1 text-gray-400 hover:text-gray-700" aria-label="메뉴 삭제">✕</button>
              )}
            </div>
          ))}
        </div>
        {menus.length < MAX_MENUS && (
          <button type="button" onClick={() => setMenus((prev) => [...prev, { name: "", price: "", file: null, preview: null }])}
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

        {uploadMsg && <p className="mt-4 text-sm text-amber-700">{uploadMsg}</p>}
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
