import type { Member } from './api'

/** 상품 등록·수정·삭제는 ADMIN만 할 수 있다. 화면의 관리자 판정은 모두 이 함수를 쓴다. */
export function isAdmin(member: Member | null): boolean {
  return member?.role === 'ADMIN'
}
