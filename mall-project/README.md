# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## E2E 테스트 (Playwright)

로그인·마이페이지·상품 쓰기 접근 제한·관리자 회원 관리를 브라우저로 검증한다. 테스트용 vite를 5175 포트로 자동 기동하며 파일은 `e2e/`에 있다.

### 준비

1. 백엔드 `pc-mall`(:8086)을 먼저 기동한다. `/health`가 200이 아니면 시작 단계에서 바로 실패한다.
2. 환경변수 `DB_PASSWORD`(개발 DB 비밀번호)를 설정한다. `e2e_` 계정 정리와 ADMIN 지정에 로컬 MySQL CLI를 쓴다.
   기본값: 호스트 `localhost`, 포트 `3306`, DB `dbdemoboard`, 계정 `demoboard`, `MYSQL_BIN`=`C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe`. 필요하면 `DB_HOST`·`DB_PORT`·`DB_NAME`·`DB_USERNAME`·`MYSQL_BIN`으로 바꾼다.
3. 처음 한 번 브라우저를 설치한다(사용자 폴더 `%USERPROFILE%\AppData\Local\ms-playwright`에 약 0.7GB).

```powershell
npm ci
npx playwright install chromium
```

### 실행

```powershell
npm run e2e                           # 전체
npx playwright test e2e/auth.spec.ts  # 스펙 하나
```

- 직렬로 실행한다(공유 DB). 실행 전에 `e2e_` 접두사 계정(`e2e_adm`, `e2e_usr`, `e2e_my`, `e2e_t1`, `e2e_t2`)을 가입시키고 `e2e_adm`만 ADMIN으로 올리며, 실행 후 `e2e_` 계정과 그 로그인 시도 기록을 지운다. 이 접두사가 아닌 회원은 건드리지 않고, 10건을 넘으면 삭제를 중단한다.
- 상품은 만들거나 저장하지 않는다.
- 화면의 `/api` 프록시는 `vite.config.ts`의 8086으로 고정이다. `E2E_BACKEND_URL`은 준비 단계의 백엔드 호출 주소만 바꾼다.
