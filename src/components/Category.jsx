import { useState } from 'react';

const categories = ["전체", "빵", "케이크", "타르트", "구움과자", "기타"];

function Category( { selected, onSelect }){

    const [open, setOpen] = useState(false);
    
    return(
        <div className="absolute left-5 top-10">
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
            >
                <img src='/category.svg' width={35} height={35} />
            </button>

            {open && (
                <ul className="mt-3 space-y-2 rounded-[20px] bg-pink-200 p-6 shadow-md">
                    {categories.map((kind) => (
                        <li
                            key={kind}
                            onClick={() => onSelect(kind)}
                            className={`cursor-pointer flex justify-center rounded-xl py-2 text-sm font-medium ${selected === kind ? 'text-rose-500' : 'text-gray-700'}`}
                        >
                            {kind}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default Category;