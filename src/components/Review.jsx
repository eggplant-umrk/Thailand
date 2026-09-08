import { useState } from 'react'
import './Review.css'

function Review({ story }) {
  const cards = story?.review ?? []
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [imageError, setImageError] = useState(false)
  // 将来のコレクション機能向けの下地（記録のみ。UI・永続化は未実装）
  const [, setCollectedIds] = useState(() => new Set())

  const currentCard = cards[cardIndex]
  const isFinished = cardIndex >= cards.length

  const handleFlip = () => {
    if (!currentCard) return
    setFlipped((value) => {
      const next = !value
      if (next) {
        const id = currentCard.annotationId ?? currentCard.id
        if (id) {
          setCollectedIds((prev) => {
            const nextSet = new Set(prev)
            nextSet.add(id)
            return nextSet
          })
        }
      }
      return next
    })
  }

  const handleNextCard = () => {
    setFlipped(false)
    setImageError(false)
    setCardIndex((index) => index + 1)
  }

  if (cards.length === 0) {
    return (
      <div className="review">
        <p>振り返りカードがありません。</p>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="review">
        <div className="review__done">
          <p>全部 覚えたね！</p>
          <p>お疲れさま！</p>
        </div>
      </div>
    )
  }

  return (
    <div className="review">
      <p className="review__count">
        {cardIndex + 1} / {cards.length}
      </p>
      <button
        type="button"
        className={`review__card${flipped ? ' review__card--flipped' : ''}`}
        onClick={handleFlip}
      >
        {!flipped ? (
          currentCard.image && !imageError ? (
            <img src={currentCard.image} alt="" onError={() => setImageError(true)} />
          ) : (
            <div className="review__image-placeholder">画像準備中</div>
          )
        ) : (
          <div className="review__back">
            <p className="review__word">{currentCard.word}</p>
            {currentCard.reading && <p className="review__reading">{currentCard.reading}</p>}
            <p className="review__meaning">{currentCard.meaning}</p>
          </div>
        )}
      </button>
      <button type="button" className="review__next" onClick={handleNextCard}>
        次のカードへ
      </button>
    </div>
  )
}

export default Review
