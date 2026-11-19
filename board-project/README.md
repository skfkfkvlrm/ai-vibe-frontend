# board-project

게시판 프론트엔드입니다. React 19 + TypeScript + Vite + React Router로 만들었고, 백엔드 `ai-vibe-backend/demo-board`(포트 8084)와 함께 동작합니다.

## 실행

1. 백엔드를 먼저 띄웁니다(8084). 방법은 `ai-vibe-backend` 저장소 README의 "demo-board 실행 안내"를 참고하세요.
2. 이 폴더에서 개발 서버를 실행합니다.

```powershell
npm install      # 처음 한 번
npm run dev      # http://localhost:5173
```

개발 서버는 `/api` 요청을 `http://localhost:8084`로 전달합니다([vite.config.ts](vite.config.ts)).

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 검사 + 빌드(`dist/`) |
| `npm run lint` | Oxlint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## 화면 경로

| 경로 | 화면 |
|---|---|
| `/boards` | 게시글 목록(검색·페이징은 주소로 유지: `?page=&size=&field=&q=`, page는 1부터) |
| `/login`, `/signup` | 로그인, 회원가입 |
| `/mypage` | 내 정보(정보 수정, 비밀번호 변경, 내가 쓴 글, 회원 탈퇴) |
| `/admin` | 관리자(삭제된 글 복구, 회원 밴·비밀번호 초기화, 감사 로그) — 관리자 계정만 |

## 폴더 구조 (`src/`)

기능(도메인)별로 화면과 API 호출을 한 폴더에 둡니다.

```
features/
  auth/      로그인·가입 화면, AuthProvider(로그인 상태), api.ts
  board/     게시판 목록·글쓰기·답글·검색·페이지 이동, api.ts
  account/   내 정보 페이지, 임시 비밀번호 변경 안내, api.ts
  admin/     관리자 화면, api.ts
shared/      Loading, token(sessionStorage), http(공용 요청·오류 처리)
```

- 로그인 토큰은 `sessionStorage`에 보관하므로 탭을 닫으면 로그아웃됩니다.
- 글 조회수는 같은 탭에서 이미 연 글을 다시 열어도 오르지 않습니다(탭 단위, 서버에는 기록하지 않음).
