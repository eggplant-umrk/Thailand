// TODO: 実装予定
// - フラッシュカード表示（表面: 絵、裏面: 単語・意味・読み方）
// - 絵本を最後まで読み終えたら自動的にこの画面へ遷移

function Review({ story }) {
  return (
    <div className="review">
      <p>Review（未実装）: {story?.title}</p>
    </div>
  )
}

export default Review
