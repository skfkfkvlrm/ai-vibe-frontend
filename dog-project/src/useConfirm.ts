import { useCallback, useEffect, useState } from 'react'

// 화면 안 2차 확인 상태. arm()하면 확인 상태가 되고, ms 뒤에 자동으로 원래 상태로 돌아간다.
export function useConfirm(ms = 5000) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), ms)
    return () => window.clearTimeout(timer)
  }, [armed, ms])

  const arm = useCallback(() => setArmed(true), [])
  const disarm = useCallback(() => setArmed(false), [])

  return { armed, arm, disarm }
}
