export default function StoreDoc({store}) {

  return(
    <div className='pt-6'>
      <div className="flex pb-5">
        <img src="/Address.svg" alt="add" width={20} height={20} />
        <span className="pl-2 font-semibold text-gray-600 text-[15px]">주소</span>
        <span className="pl-3">{store?.address}</span>
      </div>

      <div className="flex">
        <img src="/Tel.svg" alt="Tel" width={20} height={20} />
        <span className="pl-2 font-semibold text-gray-600 text-[15px]">연락처</span>
        <span className="pl-3">{store?.tel}</span>
      </div>
    </div>
  )
}