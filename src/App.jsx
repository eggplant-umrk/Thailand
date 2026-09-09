import { useEffect, useState } from 'react'
import story01 from './stories/story01.json'
import StoryViewer from './components/StoryViewer'
import Review from './components/Review'
import './App.css'

// TODO: 実装予定
// - 物語データの読み込み方法の整理（複数話に対応する場合は一覧化）

function App() {
  const [view, setView] = useState('story')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  return (
    <div className="app">
      <header className="app__header">
        <h1>タイ語えほん</h1>
      </header>
      <main>
        {view === 'story' ? (
          <StoryViewer story={story01} onFinish={() => setView('review')} />
        ) : (
          <Review story={story01} />
        )}
      </main>
    </div>
  )
}

export default App
