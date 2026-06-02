import { useState } from 'react';

import CategoryBtn from '../assets/icons/category.svg?react';
import style from '../css/Home.module.css';

const categories = ["전체", "빵", "케이크", "타르트", "구움과자", "기타"];

function Category( { selected, onSelect }){

    const [open, setOpen] = useState(false);
    
    return(
        <div className={style.category}>
            <button onClick={() => setOpen(!open)}>
                <CategoryBtn width={35} height={35} />
            </button>

            {open && (
                <ul className={style.categoryli}>
                    {categories.map((kind) => (
                        <li
                            key={kind}
                            onClick={() => {
                                onSelect(kind);
                            }}
                            className={selected === kind ? style.select : ""}>
                            
                            {kind}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default Category;