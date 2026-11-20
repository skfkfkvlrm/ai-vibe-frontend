import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createSchedule, deleteSchedule, listSchedules, updateSchedule, type ScheduleInput } from './api'
import { formatDate, type Schedule } from './schedule'

const EMPTY: ScheduleInput = { gdate: '', game: '1', team: '' }

export default function ManagePage() {
  const [list, setList] = useState<Schedule[] | null>(null)
  const [form, setForm] = useState<ScheduleInput>(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => listSchedules().then(setList).catch((e: Error) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  const reset = () => { setForm(EMPTY); setEditId(null) }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (editId === null) await createSchedule(form)
      else await updateSchedule(editId, form)
      reset()
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function remove(s: Schedule) {
    if (!window.confirm(`${formatDate(s.gdate)} ${s.team} 경기를 삭제할까요?`)) return
    setError('')
    try {
      await deleteSchedule(s.id)
      if (editId === s.id) reset()
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function edit(s: Schedule) {
    setEditId(s.id)
    setForm({ gdate: s.gdate, game: s.game, team: s.team })
  }

  return (
    <main className="wrap">
      <header className="bar">
        <h1>일정 관리</h1>
        <Link to="/hanabank" className="btn">일정 보기</Link>
      </header>

      <form className="form" onSubmit={submit}>
        <h2>{editId === null ? '일정 추가' : `일정 수정 (#${editId})`}</h2>
        <label>경기일자
          <input type="date" required value={form.gdate} onChange={(e) => setForm({ ...form, gdate: e.target.value })} />
        </label>
        <label>구분
          <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}>
            <option value="1">홈</option>
            <option value="0">원정</option>
          </select>
        </label>
        <label>상대팀
          <input required maxLength={20} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button type="submit" className="btn primary">{editId === null ? '추가' : '저장'}</button>
          {editId !== null && <button type="button" className="btn" onClick={reset}>취소</button>}
        </div>
      </form>

      {!list ? <p className="msg">불러오는 중…</p> : (
        <table className="tbl">
          <thead><tr><th>일자</th><th>구분</th><th>상대팀</th><th /></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{formatDate(s.gdate)}</td>
                <td>{s.game === '1' ? '홈' : '원정'}</td>
                <td>{s.team}</td>
                <td className="act">
                  <button type="button" className="btn" onClick={() => edit(s)}>수정</button>
                  <button type="button" className="btn danger" onClick={() => remove(s)}>삭제</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="msg">등록된 일정이 없습니다.</td></tr>}
          </tbody>
        </table>
      )}
    </main>
  )
}
