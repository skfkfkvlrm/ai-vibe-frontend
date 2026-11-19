import type { Member } from '../auth/api'
import type { Board, BoardInput } from './api'
import BoardForm from './BoardForm'
import DeleteConfirm from './DeleteConfirm'

/** 한 번에 하나만 열리는 인라인 폼. create는 목록 상단, 나머지는 해당 글 아래에 열린다. */
export type ActiveForm = { kind: 'create' } | { kind: 'edit' | 'reply' | 'delete'; id: number }

interface Props {
  board: Board
  content: string | null
  /** 로그인한 회원. 비로그인이면 null */
  member: Member | null
  active: ActiveForm | null
  onActive: (a: ActiveForm | null) => void
  onEdit: (id: number, input: BoardInput) => Promise<void>
  onReply: (id: number, input: BoardInput) => Promise<void>
  onDelete: (id: number, pass?: string) => Promise<void>
}

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

/**
 * 원글 또는 답글 한 건: 본문, 수정·삭제·답글 버튼, 해당 글에 열린 인라인 폼.
 * 회원 글은 작성 회원에게만 수정·삭제 버튼이 보이고(비밀번호 불필요),
 * 비회원 글(기존 글 포함)은 누구에게나 보이며 글별 비밀번호가 필요하다.
 */
function PostBlock({ board, content, member, active, onActive, onEdit, onReply, onDelete }: Props) {
  const id = board.board_num
  const isMemberPost = board.member_id !== null
  const isOwner = member !== null && board.member_id === member.member_id
  // 관리자는 모든 글을 수정·삭제할 수 있다(비밀번호 불필요). 최종 판정은 서버가 DB의 role로 한다.
  const isAdmin = member?.role === 'ADMIN'
  const canManage = !isMemberPost || isOwner || isAdmin
  // 비밀번호가 필요 없는 경우: 회원 글의 소유자, 또는 관리자
  const noPassword = isOwner || isAdmin

  const mine = active && active.kind !== 'create' && active.id === id ? active.kind : null
  const toggle = (kind: 'edit' | 'reply' | 'delete') =>
    onActive(mine === kind ? null : { kind, id })

  return (
    <div className="post">
      {board.re_lev > 0 && (
        <div className="post-head">
          <strong>{board.board_subject}</strong>
          <span className="board-reply-meta">
            {board.board_name} · {formatDate(board.board_date)}
          </span>
        </div>
      )}
      <div className="post-body">
        <div className="board-content">{content || '(본문 없음)'}</div>
        <div className="post-actions">
          {canManage && (
            <>
              <button type="button" aria-pressed={mine === 'edit'} onClick={() => toggle('edit')}>
                수정
              </button>
              <button type="button" aria-pressed={mine === 'delete'} onClick={() => toggle('delete')}>
                삭제
              </button>
            </>
          )}
          <button type="button" aria-pressed={mine === 'reply'} onClick={() => toggle('reply')}>
            답글
          </button>
        </div>
      </div>
      {mine === 'edit' && canManage && (
        <BoardForm
          // 로그인 상태가 바뀌면 폼을 새로 만들어 입력란 구성을 맞춘다.
          key={member ? 'member' : 'guest'}
          title="수정"
          submitLabel="수정 저장"
          initial={{
            name: board.board_name,
            subject: board.board_subject,
            content: content ?? '',
          }}
          authed={
            noPassword
              ? { name: board.board_name, note: isOwner ? undefined : '관리자 권한으로 수정' }
              : undefined
          }
          onSubmit={(input) => onEdit(id, input)}
          onCancel={() => onActive(null)}
        />
      )}
      {mine === 'reply' && (
        <BoardForm
          key={member ? 'member' : 'guest'}
          title="답글 작성"
          submitLabel="답글 등록"
          authed={member ? { name: member.name } : undefined}
          onSubmit={(input) => onReply(id, input)}
          onCancel={() => onActive(null)}
        />
      )}
      {mine === 'delete' && canManage && (
        <DeleteConfirm
          key={member ? 'member' : 'guest'}
          needPassword={!noPassword}
          onConfirm={(pass) => onDelete(id, pass)}
          onCancel={() => onActive(null)}
        />
      )}
    </div>
  )
}

export default PostBlock
