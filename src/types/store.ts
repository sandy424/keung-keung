export type Store = {
  id: string        // Firestore 자동 ID는 string
  name: string
  category: string[]  // 배열로 저장했으니까
  address: string
  tel: string       // 전화번호는 string
  lat: number
  lng: number
  avgRating: number  // rating → avgRating으로 바꿨었으니까
}