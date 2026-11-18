# ai-vibe-frontend

React(Vite) 프론트엔드 2개를 폴더별로 묶은 저장소입니다. 각 폴더는 독립 npm 프로젝트입니다. 원본 저장소의 커밋 히스토리를 보존했습니다.

| 폴더 | 원본 저장소 | 연결 백엔드(`ai-vibe-backend`) |
|---|---|---|
| demo-boot-react | demo-boot-react | demo-boot (8081) |
| dog-project | dog-project | demo-dog (8082) |

- 개발 서버 proxy는 각 `vite.config.ts`에 있습니다.
- 빌드: 각 폴더에서 `npm ci` 후 `npm run build`