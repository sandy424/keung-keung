import { useState } from 'react';
import { ALL, CATEGORY_LIST } from '../config/categories';

const items = [ALL, ...CATEGORY_LIST.map((c) => c.name)];

function Category( { selected, onSelect }){

    const [open, setOpen] = useState(false);

    return(
        <div className="absolute left-5 top-10">
            <button
                onClick={() => setOpen(!open)}
                aria-label="카테고리 선택"
                aria-expanded={open}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/10 bg-white shadow-md"
            >
                <img src='/category.svg' width={35} height={35} alt="" />
            </button>

            {open && (
                <ul className="mt-3 grid w-56 grid-cols-2 gap-1 rounded-2xl border border-amber-900/10 bg-white p-2 shadow-lg shadow-amber-950/10">
                    {items.map((name) => (
                        <li key={name}>
                            <button
                                type="button"
                                onClick={() => onSelect(name)}
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
