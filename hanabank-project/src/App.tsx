import { useEffect, useState } from 'react'
import { formatDate, matchup, type Schedule } from './schedule'

function App() {
  const [list, setList] = useState<Schedule[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/hanabank/schedules')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setList)
      .catch(() => setError(true))
  }, [])

  if (error) return <p className="msg">일정을 불러오지 못했습니다.</p>
  if (!list) return <p className="msg">불러오는 중…</p>

  return (
    <main className="wrap">
      <h1>하나은행 경기 일정</h1>
      {list.map((s) => (
        <section key={s.id} className="game">
          <div className="date">{formatDate(s.gdate)}</div>
          <div className="match">{matchup(s)}</div>
        </section>
      ))}
    </main>
  )
}

export default App
