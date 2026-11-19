import type { Board, BoardInput } from './api/boards'
import BoardForm from './BoardForm'
import DeleteConfirm from './DeleteConfirm'

/** 한 번에 하나만 열리는 인라인 폼. create는 목록 상단, 나머지는 해당 글 아래에 열린다. */
export type ActiveForm = { kind: 'create' } | { kind: 'edit' | 'reply' | 'delete'; id: number }

interface Props {
  board: Board
  content: string | null
  active: ActiveForm | null
  onActive: (a: ActiveForm | null) => void
  onEdit: (id: number, input: BoardInput) => Promise<void>
  onReply: (id: number, input: BoardInput) => Promise<void>
  onDelete: (id: number, pass: string) => Promise<void>
}

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

/** 원글 또는 답글 한 건: 본문, 수정·삭제·답글 버튼, 해당 글에 열린 인라인 폼. */
function PostBlock({ board, content, active, onActive, onEdit, onReply, onDelete }: Props) {
  const id = board.board_num
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
          <button type="button" aria-pressed={mine === 'edit'} onClick={() => toggle('edit')}>
            수정
          </button>
          <button type="button" aria-pressed={mine === 'delete'} onClick={() => toggle('delete')}>
            삭제
          </button>
          <button type="button" aria-pressed={mine === 'reply'} onClick={() => toggle('reply')}>
            답글
          </button>
        </div>
      </div>
      {mine === 'edit' && (
        <BoardForm
          title="수정"
          submitLabel="수정 저장"
          initial={{
            name: board.board_name,
            subject: board.board_subject,
            content: content ?? '',
          }}
          onSubmit={(input) => onEdit(id, input)}
          onCancel={() => onActive(null)}
        />
      )}
      {mine === 'reply' && (
        <BoardForm
          title="답글 작성"
          submitLabel="답글 등록"
          onSubmit={(input) => onReply(id, input)}
          onCancel={() => onActive(null)}
        />
      )}
      {mine === 'delete' && (
        <DeleteConfirm onConfirm={(pass) => onDelete(id, pass)} onCancel={() => onActive(null)} />
      )}
    </div>
  )
}

export default PostBlock
