export type ToastKind = 'success' | 'error'
export type Notify = (kind: ToastKind, text: string) => void
export type ToastData = { id: number; kind: ToastKind; text: string }

// 화면 우하단 알림. 성공은 role=status, 실패는 role=alert로 스크린리더에 읽힌다.
function Toast({ toast }: { toast: ToastData | null }) {
  if (!toast) return null
  return (
    <div
      key={toast.id}
      className={`toast toast-${toast.kind}`}
      role={toast.kind === 'error' ? 'alert' : 'status'}
    >
      {toast.text}
    </div>
  )
}

export default Toast
