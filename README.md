# ai-vibe-frontend

React(Vite + TypeScript) 프론트엔드 4개를 폴더별로 묶은 모노레포입니다. 각 폴더는 독립 npm 프로젝트이며 원본 저장소의 커밋 히스토리를 보존했습니다.

| 폴더 | 원본 / 기반 | 연결 백엔드(`ai-vibe-backend`) | 포트 (Proxy) | 주요 기능 |
|---|---|---|---|---|
| `demo-boot-react` | `demo-boot-react` | `demo-boot` | `8081` | 메모/노트 CRUD (최신 수정순 목록) |
| `dog-project` | `dog-project` | `demo-dog` | `8082` | 반려견 관리 CRUD, 이미지 업로드/표시, 삭제 복구 탭, 2단계 확인 토스트 |
| `board-project` | `board-project` | `demo-board` | `8084` | JWT 인증(로그인/회원가입), 게시판 목록·검색·페이징·답글·soft delete, 마이페이지, 관리자(`admin`) 감사·회원 관리 |
| `mall-project` | `mall-project` | `pc-mall` (`demo-mall`) | `8086` | 상품 이미지 그리드 목록, 상세 조회, 상품 등록·수정·soft delete, 로그인/회원가입 연동 |

## 공통 실행 방법

- 각 프로젝트 폴더로 이동해 의존성 설치 후 개발 서버 또는 빌드를 실행합니다.
- 개발 서버 API/이미지 프록시 설정은 각 프로젝트의 `vite.config.ts`에 정의되어 있습니다.

```powershell
cd <프로젝트_폴더>   # 예: board-project
npm ci              # 또는 npm install
npm run dev         # 개발 서버 (기본 http://localhost:5173)
npm run build       # TypeScript 검사 + Vite 프로덕션 빌드 (dist/)
npm run lint        # Oxlint 정적 검사
```

- 자세한 백엔드 실행 및 DB/환경변수 안내는 [`ai-vibe-backend`](https://github.com/skfkfkvlrm/ai-vibe-backend) 저장소 `README.md`를 참고하세요.
