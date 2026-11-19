import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import '../../App.css'

/**
 * 관리자가 임시 비밀번호로 초기화한 계정으로 로그인하면 한 번 띄우는 안내.
 * 강제는 아니며 "나중에"로 닫을 수 있고, 내 정보 페이지에는 변경할 때까지 안내 문구가 남는다.
 */
function ResetNoticeDialog() {
  const { member, resetNoticeDismissed, dismissResetNotice } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!member?.password_reset_pending || resetNoticeDismissed || pathname === '/mypage') return null

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-notice-title">
        <h2 id="reset-notice-title">비밀번호를 변경해 주세요</h2>
        <p>
          임시 비밀번호로 로그인하셨습니다. 보안을 위해 내 정보 페이지에서 새 비밀번호로 직접 변경해 주세요.
        </p>
        <div className="modal-actions">
          <button
            type="button"
            onClick={() => {
              dismissResetNotice()
              navigate('/mypage')
            }}
          >
            내 정보로 이동
          </button>
          <button type="button" onClick={dismissResetNotice}>
            나중에
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetNoticeDialog
