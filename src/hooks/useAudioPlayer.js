import { useCallback, useEffect, useRef, useState } from 'react'

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

export default useAudioPlayer
