import { useNavigate } from 'react-router-dom';

function Bottombar() {

    const nav = useNavigate();
  
    return(
        <div className="absolute left-[80px] right-[80px] bottom-5 z-10 flex justify-around rounded-[18px] bg-white px-4 py-3 shadow-lg">
                <button className="flex flex-col items-center gap-2 rounded-2xl bg-transparent text-sm text-gray-700 hover:text-black"
                  onClick={() => nav('/hotplace')}>
                  <img src='/Fire.svg' width={35} height={35} />
                  <div>핫플레이스</div>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-2xl bg-transparent text-sm text-gray-700 hover:text-black"
                  onClick={() => nav('/saved')}>
                  <img src='/SaveHeart.svg' width={30} height={30} />
                  <div>저장</div>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-2xl bg-transparent text-sm text-gray-700 hover:text-black"
                  onClick={() => nav('/mypage')}>
                  <img src='Profile.svg' width={35} height={35}/>
                  <div>마이페이지</div>
                </button>
              </div>
    )
}
export default Bottombar;