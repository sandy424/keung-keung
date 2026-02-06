import { useState } from 'react';

import CategoryBtn from '../assets/icons/category.svg?react';
import style from '../css/Home.module.css';

const categories = ["전체", "빵", "케이크", "타르트", "구움과자", "기타"];

function Category(){

    const [category, setCategory] = useState(false);
    const [select, setSelect] = useState("전체");
    
    return(
        <div className={style.category}>
            <button onClick={() => setCategory(!category)}>
                <CategoryBtn width={35} height={35} />
            </button>

            {category && (
                <ul className={style.categoryli}>
                    {categories.map((cat) => (
                        <li
                            key={cat}
                            onClick={() => setSelect(cat)}
                            className={select === cat ? style.select : ""}>
                            
                            {cat}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default Category;