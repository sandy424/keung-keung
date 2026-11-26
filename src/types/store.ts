export type Menu = {
  name: string
  price?: number | null
  photo?: string | null // Firebase Storage 다운로드 URL
}

export type Store = {
  id: string
  name: string
  category: string[]
  address: string
  tel: string
  lat: number
  lng: number
  avgRating: number | string | null
  reviewCount?: number | null
  hours?: string
  description?: string
  menus?: Menu[]
  region?: string
  // Google Places 가게 ID (전화번호·영업시간 조회용, 약관상 저장 허용)
  googlePlaceId?: string
  tags?: string[]
  // 이 가게를 추천(등록)한 사용자
  createdBy?: string
  recommender?: string
}

export type RatingKey = "taste" | "mood" | "kind" | "price"
export type Rating = Record<RatingKey, number>

export type Review = {
  id: string
  text: string
  rating?: Rating
  userId?: string
  nickname?: string
  createdAt?: { toDate: () => Date } | null
}
