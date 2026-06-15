import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Detail() {

    const location = useLocation();
    const nav = useNavigate();
    const store = location.state?.store;

    const [saved, setSaved] = useState(false);
    
    const toggleSaved = () => {
        setSaved(prev => !prev);
    };

    return(
        <div className="mx-auto w-full max-w-175 h-full bg-white">
            <div className="flex items-center p-5">
                <button onClick={() => nav(-1)} className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2">
                    <img src='/Last.svg' width={24} height={24} alt="뒤로가기" />
                </button>
            </div>
            <div className="m-6 rounded-[30px] border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{store?.name}</h2>
                    <button type="button" onClick={toggleSaved} className="inline-flex items-center justify-center rounded-full p-1">
                        <img src='/Heart.svg' width={28} height={28} alt="즐겨찾기" />
                    </button>
                </div>
            </div>
        </div>
    )
}
export default Detail;