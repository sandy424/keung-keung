import { useState } from 'react';
import { ALL, CATEGORY_LIST } from '../config/categories';

const items = [{ name: ALL, emoji: '🍽️' }, ...CATEGORY_LIST];

function Category( { selected, onSelect }){

    const [open, setOpen] = useState(false);

    return(
        <div className="absolute left-5 top-10">
            <button
                onClick={() => setOpen(!open)}
                aria-label="카테고리 선택"
                aria-expanded={open}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
            >
                <img src='/category.svg' width={35} height={35} alt="" />
            </button>

            {open && (
                <ul className="mt-3 grid w-56 grid-cols-2 gap-1.5 rounded-[20px] bg-pink-200 p-3 shadow-md">
                    {items.map(({ name, emoji }) => (
                        <li key={name}>
                            <button
                                type="button"
                                onClick={() => onSelect(name)}
                                className={`flex w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-medium transition ${selected === name ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-700 hover:bg-pink-100'}`}
                            >
                                <span aria-hidden="true">{emoji}</span>
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
