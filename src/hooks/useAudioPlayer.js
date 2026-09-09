import { useCallback, useEffect, useRef, useState } from 'react'

function useAudioPlayer(src) {
  const audioElRef = useRef(null)
  const srcRef = useRef(src)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  // toggle()内から常に最新のsrcを参照できるようにする（毎レンダーで同期するだけで
  // 再レンダーは発生させない）
  srcRef.current = src

  useEffect(() => {
    setIsPlaying(false)
    setHasError(false)
  }, [src])

  // <audio>要素はJA/TH表示トグルやカードのフリップで条件付きレンダリングされ
  // アンマウント/リマウントされるため、コールバックrefでマウントのたびに状態をリセットする。
  // 外れる古い要素は参照を失う前にpause()し、UIから見えなくなった後も鳴り続けるのを防ぐ
  const audioRef = useCallback((node) => {
    if (audioElRef.current && audioElRef.current !== node) {
      audioElRef.current.pause()
    }
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
    const requestedSrc = srcRef.current
    const playResult = audio.play()
    if (playResult && typeof playResult.then === 'function') {
      // audioがアンマウント/リマウントされて別の要素に差し替わった後、または
      // 同じ要素のままsrcだけが差し替わった後にPromiseが解決すると、無関係になった
      // 状態を誤って上書きしてしまうため、要素とsrcが両方とも当時のままの場合のみ
      // 状態を更新する
      const isStillCurrent = () => audioElRef.current === audio && srcRef.current === requestedSrc
      playResult
        .then(() => {
          if (isStillCurrent()) setIsPlaying(true)
        })
        .catch(() => {
          if (isStillCurrent()) setHasError(true)
        })
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
