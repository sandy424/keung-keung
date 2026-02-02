import {GiFireBowl} from 'react-icons/gi';
import { FaRegCalendarCheck } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";
import sytle from '../css/BottomBar.module.css';

function BottomBar() {
    return(
        <footer className={sytle.bottom}>
            <div className={sytle.icons}>
                <GiFireBowl size={30}/>
                <div>핫플레이스</div>
            </div>
            <div className={sytle.icons}>
                <FaRegCalendarCheck size={25}/>
                <div>예약</div>
            </div>
            <div className={sytle.icons}>
                <FaRegHeart size={25}/>
                <div>저장</div>
            </div>
            <div className={sytle.icons}>
                <IoPersonCircleOutline size={30}/>
                <div>마이페이지</div>
            </div>
        </footer>
    )
}
export default BottomBar;