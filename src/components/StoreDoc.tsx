import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import type { Store } from "../types/store";
import { naverMapUrl } from "../utils/naver";

// 네이버 장소 검색 API는 영업시간을 주지 않고 전화번호도 대부분 비어 있어서,
// 가게를 추천할 때 직접 입력하지 않으면 정보가 비어 있음.
// → 비어 있으면 네이버 지도로 바로 확인할 수 있게 하고, 로그인한 사용자가 채울 수 있게 함.

type EditableKey = "tel" | "hours";

const FIELDS: Record<EditableKey, { label: string; placeholder: string; max: number; valid: (v: string) => boolean; error: string }> = {
  tel: {
    label: "연락처",
    placeholder: "051-123-4567",
    max: 20,
    valid: (v) => /^[0-9+\-\s()]{7,20}$/.test(v),
    error: "숫자와 - 로 전화번호를 입력해 주세요.",
  },
  hours: {
    label: "영업시간",
    placeholder: "11:00 - 21:00, 월요일 휴무",
    max: 50,
    valid: (v) => v.length >= 2,
    error: "영업시간을 입력해 주세요.",
  },
};

type Props = { store: Store; onUpdated?: () => void };

export default function StoreDoc({ store, onUpdated }: Props) {
  const { user } = useAuth();
  const naverUrl = naverMapUrl(store);

  return (
    <div className="pt-2">
      {store.description && <p className="mb-5 text-amber-900/70">{store.description}</p>}

      <dl className="divide-y divide-amber-900/10 border-y border-amber-900/10">
        <Row icon={<PinIcon />} label="주소">
          <span className="text-amber-950">{store.address}</span>
        </Row>
        <EditableRow icon={<PhoneIcon />} field="tel" store={store} canEdit={!!user} naverUrl={naverUrl} onUpdated={onUpdated}
          render={(v) => (
            <a href={`tel:${v.replace(/[^0-9+]/g, "")}`} className="text-amber-950 underline-offset-4 hover:underline">{v}</a>
          )} />
        <EditableRow icon={<ClockIcon />} field="hours" store={store} canEdit={!!user} naverUrl={naverUrl} onUpdated={onUpdated}
          render={(v) => <span className="whitespace-pre-line text-amber-950">{v}</span>} />
      </dl>

      <a href={naverUrl} target="_blank" rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-amber-900/15 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-50">
        네이버 지도에서 사진·리뷰 더 보기 <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3.5 text-[15px]">
      <span className="mt-0.5 shrink-0 text-amber-900/40">{icon}</span>
      <dt className="w-16 shrink-0 text-sm font-medium leading-6 text-amber-900/50">{label}</dt>
      <dd className="min-w-0 flex-1 leading-6">{children}</dd>
    </div>
  );
}

type EditableRowProps = {
  icon: React.ReactNode;
  field: EditableKey;
  store: Store;
  canEdit: boolean;
  naverUrl: string;
  onUpdated?: () => void;
  render: (value: string) => React.ReactNode;
};

function EditableRow({ icon, field, store, canEdit, naverUrl, onUpdated, render }: EditableRowProps) {
  const cfg = FIELDS[field];
  const [saved, setSaved] = useState(""); // 저장 직후 바로 보여주기
  const value = (store[field] ?? "").trim() || saved;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const v = draft.trim();
    if (!cfg.valid(v)) {
      setError(cfg.error);
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "shops", store.id), { [field]: v });
      setSaved(v);
      setEditing(false);
      onUpdated?.();
    } catch (e) {
      console.error(`${cfg.label} 저장 실패`, e);
      setError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Row icon={icon} label={cfg.label}>
      {value ? (
        render(value)
      ) : editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save(); }}>
          <input autoFocus value={draft} maxLength={cfg.max} placeholder={cfg.placeholder}
            inputMode={field === "tel" ? "tel" : "text"}
            onChange={(e) => { setDraft(e.target.value); setError(""); }}
            className="w-full rounded-lg border border-amber-900/15 px-3 py-2 text-sm text-amber-950 placeholder:text-amber-900/35 focus:border-amber-950 focus:outline-none" />
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          <div className="mt-2 flex gap-2 text-sm">
            <button type="submit" disabled={saving || !draft.trim()}
              className="rounded-lg bg-amber-950 px-3 py-1.5 font-semibold text-white hover:bg-amber-900 disabled:opacity-30">
              {saving ? "저장 중..." : "저장"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setError(""); }}
              className="rounded-lg px-3 py-1.5 text-amber-900/60 hover:bg-amber-50">취소</button>
          </div>
        </form>
      ) : (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-amber-900/40">등록된 정보가 없어요</span>
          <a href={naverUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-950 underline underline-offset-4">
            네이버 지도에서 확인
          </a>
          {canEdit && (
            <button type="button" onClick={() => { setDraft(""); setEditing(true); }}
              className="font-medium text-amber-950 underline underline-offset-4">
              직접 추가
            </button>
          )}
        </span>
      )}
    </Row>
  );
}

const iconProps = {
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
};

const PinIcon = () => (
  <svg {...iconProps}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
const PhoneIcon = () => (
  <svg {...iconProps}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
);
const ClockIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
