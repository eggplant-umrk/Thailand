import { useCallback, useEffect, useRef, useState } from 'react'

function useAudioPlayer(src) {
  const audioElRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsPlaying(false)
    setHasError(false)
  }, [src])

  // <audio>要素はJA/TH表示トグルやカードのフリップで条件付きレンダリングされ
  // アンマウント/リマウントされるため、コールバックrefでマウントのたびに状態をリセットする
  const audioRef = useCallback((node) => {
    audioElRef.current = node
    setIsPlaying(false)
    setHasError(false)
  }, [])

  const toggle = useCallback(() => {
    const audio = audioElRef.current
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

export default useAudioPlayer
