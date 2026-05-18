import { useEffect, useState, useCallback } from 'react'

let toastFn = null

export function showToast(msg) {
  if (toastFn) toastFn(msg)
}

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  const show = useCallback((m) => {
    setMsg(m)
    setVisible(true)
    setTimeout(() => setVisible(false), 2000)
  }, [])

  useEffect(() => {
    toastFn = show
    return () => { toastFn = null }
  }, [show])

  return (
    <div className="toast" style={{ opacity: visible ? 1 : 0, pointerEvents: 'none' }}>
      {msg}
    </div>
  )
}
