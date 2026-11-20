import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSchedules } from './api'
import { formatDate, matchup, type Schedule } from './schedule'

export default function SchedulePage() {
  const [list, setList] = useState<Schedule[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    listSchedules().then(setList).catch(() => setError(true))
  }, [])

  if (error) return <p className="msg">일정을 불러오지 못했습니다.</p>
  if (!list) return <p className="msg">불러오는 중…</p>

  return (
    <main className="wrap">
      <header className="bar">
        <h1>하나은행 경기 일정</h1>
        <Link to="/hanabank/manage" className="btn">일정 관리</Link>
      </header>
      {list.map((s) => (
        <section key={s.id} className="game">
          <div className="date">{formatDate(s.gdate)}</div>
          <div className="match">{matchup(s)}</div>
        </section>
      ))}
    </main>
  )
}
