import { useState } from 'react';
import { ALL, CATEGORY_LIST } from '../config/categories';

const items = [ALL, ...CATEGORY_LIST.map((c) => c.name)];

function Category( { selected, onSelect }){

    const [open, setOpen] = useState(false);

    return(
        <div className="absolute left-5 top-10">
            <button
                onClick={() => setOpen(!open)}
                aria-label={`카테고리 선택, 현재 ${selected}`}
                aria-expanded={open}
                className={`inline-flex h-11 items-center gap-2 rounded-full border pl-3.5 pr-4 text-sm font-semibold shadow-md transition ${
                    open || selected !== ALL ? 'border-amber-950 bg-amber-950 text-white' : 'border-amber-900/10 bg-white text-amber-950 hover:bg-amber-50'
                }`}
            >
                {/* 필터(슬라이더) 아이콘 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
                    <circle cx="16" cy="6" r="2" />
                    <circle cx="10" cy="12" r="2" />
                    <circle cx="18" cy="18" r="2" />
                </svg>
                {selected}
            </button>

            {open && (
                <ul className="mt-3 grid w-56 grid-cols-2 gap-1 rounded-2xl border border-amber-900/10 bg-white p-2 shadow-lg shadow-amber-950/10">
                    {items.map((name) => (
                        <li key={name}>
                            <button
                                type="button"
                                onClick={() => { onSelect(name); setOpen(false); }}
                                className={`flex w-full items-center justify-center rounded-xl py-2 text-sm font-medium transition ${selected === name ? 'bg-amber-950 text-white' : 'text-amber-900/70 hover:bg-amber-50'}`}
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default Category;
