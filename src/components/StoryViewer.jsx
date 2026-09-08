import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './StoryViewer.css'

const ANNOTATION_MARKER = /\{\{([^:{}]+):([^{}]+)\}\}/g

function renderAnnotatedText(text, annotationsById, onWordTap) {
  if (!text) return null

  const nodes = []
  let lastIndex = 0
  let key = 0
  let match

  ANNOTATION_MARKER.lastIndex = 0
  while ((match = ANNOTATION_MARKER.exec(text)) !== null) {
    const [full, id, label] = match

    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
    }

    if (annotationsById.has(id)) {
      nodes.push(
        <button
          key={key++}
          type="button"
          className="story-viewer__word"
          onClick={() => onWordTap(id)}
        >
          {label}
        </button>,
      )
    } else {
      nodes.push(
        <strong key={key++} className="story-viewer__word story-viewer__word--plain">
          {label}
        </strong>,
      )
    }

    lastIndex = match.index + full.length
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>)
  }

  return nodes
}

function useAudioPlayer(src) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsPlaying(false)
    setHasError(false)
  }, [src])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      return
    }

    setHasError(false)
    audio.currentTime = 0
    const playResult = audio.play()
    if (playResult && typeof playResult.then === 'function') {
      playResult.then(() => setIsPlaying(true)).catch(() => setHasError(true))
    } else {
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleEnded = useCallback(() => setIsPlaying(false), [])
  const handleError = useCallback(() => {
    setHasError(true)
    setIsPlaying(false)
  }, [])

  return { audioRef, isPlaying, hasError, toggle, handleEnded, handleError }
}

function StoryViewer({ story, onFinish }) {
  const pages = story?.pages ?? []
  const [pageIndex, setPageIndex] = useState(0)
  const [showJa, setShowJa] = useState(true)
  const [showThai, setShowThai] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [openAnnotationId, setOpenAnnotationId] = useState(null)
  // 将来のコレクション機能向けの下地（記録のみ。UI・永続化は未実装）
  const [, setCollectedWordIds] = useState(() => new Set())

  const currentPage = pages[pageIndex]
  const isLastPage = pageIndex >= pages.length - 1

  const annotationsById = useMemo(() => {
    const map = new Map()
    for (const annotation of story?.annotations ?? []) {
      map.set(annotation.id, annotation)
    }
    return map
  }, [story])

  useEffect(() => {
    setImageError(false)
  }, [pageIndex])

  const jaAudio = useAudioPlayer(currentPage?.audioJa)
  const thaiAudio = useAudioPlayer(currentPage?.audioThai)

  const handleWordTap = useCallback((id) => {
    setCollectedWordIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setOpenAnnotationId(id)
  }, [])

  const closeCard = useCallback(() => setOpenAnnotationId(null), [])

  const handlePrev = () => {
    setPageIndex((index) => Math.max(0, index - 1))
  }

  const handleNext = () => {
    if (isLastPage) {
      onFinish?.()
      return
    }
    setPageIndex((index) => Math.min(pages.length - 1, index + 1))
  }

  if (!currentPage) {
    return (
      <div className="story-viewer">
        <p>物語データがありません。</p>
      </div>
    )
  }

  const hasThaiOnPage = Boolean(currentPage.thai)
  const openAnnotation = openAnnotationId ? annotationsById.get(openAnnotationId) : null

  return (
    <div className="story-viewer">
      <div className="story-viewer__image">
        {currentPage.image && !imageError ? (
          <img src={currentPage.image} alt="" onError={() => setImageError(true)} />
        ) : (
          <div className="story-viewer__image-placeholder">画像準備中</div>
        )}
      </div>

      <div className="story-viewer__toggles">
        <button
          type="button"
          className="story-viewer__toggle"
          aria-pressed={showJa}
          onClick={() => setShowJa((value) => !value)}
        >
          👁 日本語
        </button>
        {hasThaiOnPage && (
          <button
            type="button"
            className="story-viewer__toggle"
            aria-pressed={showThai}
            onClick={() => setShowThai((value) => !value)}
          >
            👁 タイ語
          </button>
        )}
      </div>

      <div className="story-viewer__text">
        {showJa && (
          <div className="story-viewer__text-block story-viewer__text-block--ja">
            <p>{renderAnnotatedText(currentPage.text, annotationsById, handleWordTap)}</p>
            {currentPage.audioJa && (
              <div className="story-viewer__audio">
                <button
                  type="button"
                  className={`story-viewer__audio-button${jaAudio.hasError ? ' story-viewer__audio-button--error' : ''}`}
                  onClick={jaAudio.toggle}
                >
                  {jaAudio.isPlaying ? '⏹ 停止' : '▶ 再生'}
                </button>
                <audio
                  ref={jaAudio.audioRef}
                  src={currentPage.audioJa}
                  preload="none"
                  onEnded={jaAudio.handleEnded}
                  onError={jaAudio.handleError}
                />
              </div>
            )}
          </div>
        )}

        {showThai && hasThaiOnPage && (
          <div className="story-viewer__text-block story-viewer__text-block--thai">
            <p>{renderAnnotatedText(currentPage.thai, annotationsById, handleWordTap)}</p>
            {currentPage.thaiReading && <p className="story-viewer__reading">{currentPage.thaiReading}</p>}
            {currentPage.audioThai && (
              <div className="story-viewer__audio">
                <button
                  type="button"
                  className={`story-viewer__audio-button${thaiAudio.hasError ? ' story-viewer__audio-button--error' : ''}`}
                  onClick={thaiAudio.toggle}
                >
                  {thaiAudio.isPlaying ? '⏹ 停止' : '▶ 再生'}
                </button>
                <audio
                  ref={thaiAudio.audioRef}
                  src={currentPage.audioThai}
                  preload="none"
                  onEnded={thaiAudio.handleEnded}
                  onError={thaiAudio.handleError}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="story-viewer__nav">
        <button type="button" onClick={handlePrev} disabled={pageIndex === 0}>
          ← 前へ
        </button>
        <span className="story-viewer__page-count">
          {pageIndex + 1} / {pages.length}
        </span>
        <button type="button" onClick={handleNext}>
          {isLastPage ? '読み終わる' : '次へ →'}
        </button>
      </div>

      {openAnnotation && (
        <div className="story-viewer__overlay" onClick={closeCard}>
          <div className="story-viewer__card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="story-viewer__card-close"
              onClick={closeCard}
              aria-label="閉じる"
            >
              ×
            </button>
            <h3>{openAnnotation.word}</h3>
            {openAnnotation.categories?.lifestyle && (
              <section>
                <h4>暮らし</h4>
                <p>{openAnnotation.categories.lifestyle}</p>
              </section>
            )}
            {openAnnotation.categories?.language && (
              <section>
                <h4>ことば</h4>
                <p>{openAnnotation.categories.language}</p>
              </section>
            )}
            {openAnnotation.categories?.values && (
              <section>
                <h4>価値観</h4>
                <p>{openAnnotation.categories.values}</p>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StoryViewer
