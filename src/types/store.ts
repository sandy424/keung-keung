export type Menu = {
  name: string
  price: number
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
