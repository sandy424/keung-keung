export default function storeReview({shopReview}) {

  return(
    <div className='pt-20'>
      <div className="flex gap-6">
        <h2 className="text-2xl font-bold tracking-widest mb-8">
          리뷰
        </h2>
        <span>{shopReview?.reviewCounts}</span>
      </div>
    </div>
  )
}