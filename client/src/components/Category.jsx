import { useState } from 'react';

import CategoryBtn from '../assets/icons/category.svg?react';
import style from '../css/Home.module.css';


function Category(){

    const [category, setCategory] = useState(false);
    

    return(
        <div className={style.category}>
            <button onClick={() => setCategory(!category)}>
                <CategoryBtn width={35} height={35} />
            </button>

            {category && (
                <ul className={style.categoryli}>
                    <li>빵</li>
                    <li>케이크</li>
                    <li>타르트</li>
                    <li>구움과자</li>
                    <li>기타</li>
                </ul>
            )}
        </div>
    )
}
export default Category;