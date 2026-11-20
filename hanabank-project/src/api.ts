import type { Schedule } from './schedule'

export type ScheduleInput = Omit<Schedule, 'id'>

const BASE = '/api/hanabank/schedules'

async function check(r: Response): Promise<Response> {
  if (!r.ok) {
    let msg = `요청에 실패했습니다. (${r.status})`
    try { msg = (await r.json()).message ?? msg } catch { /* 본문 없음 */ }
    throw new Error(msg)
  }
  return r
}

const json = (method: string, body: ScheduleInput) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const listSchedules = (): Promise<Schedule[]> => fetch(BASE).then(check).then((r) => r.json())
export const createSchedule = (b: ScheduleInput) => fetch(BASE, json('POST', b)).then(check)
export const updateSchedule = (id: number, b: ScheduleInput) => fetch(`${BASE}/${id}`, json('PUT', b)).then(check)
export const deleteSchedule = (id: number) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(check)
