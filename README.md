# 단순 게시판 서비스

회원가입 없이 닉네임·비밀번호만으로 글을 쓰고 읽을 수 있는 게시판 서비스.

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프론트엔드 | Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 |
| 백엔드 | NestJS 11 · TypeScript |
| ORM | TypeORM 0.3 |
| DB | PostgreSQL 16 |
| 인프라 | Docker Compose |

---

## 시작하기

```bash
# 1. 환경변수 설정
cp .env.example .env

# 2. DB 실행
docker compose up -d

# 3. 백엔드 실행 (코드 작성 후)
cd backend && npm run start:dev

# 4. 프론트엔드 실행 (코드 작성 후)
cd frontend && npm run dev
```

| 서비스 | URL |
|---|---|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |

---

## 프로젝트 구조

```
bdd-test/
├── docs/
│   ├── PRD.md            # 기획서 (요구사항)
│   ├── ARCHITECTURE.md   # 아키텍처 설계
│   ├── ERD.md            # 데이터 모델
│   ├── BDD.md            # 행위 기반 테스트 시나리오
│   ├── API.md            # API 명세서
│   └── BDD-EFFECT.md     # BDD 효과성 케이스 스터디
├── frontend/             # Next.js 앱 (예정)
├── backend/              # NestJS 앱 (예정)
├── docker-compose.yml
└── .env.example
```

---

## 문서

| 문서 | 설명 |
|---|---|
| [PRD](docs/PRD.md) | 사용자 스토리, 기능 명세, 비기능 요구사항 |
| [Architecture](docs/ARCHITECTURE.md) | 레이어 구조, 품질 속성, 기술 선택 근거 |
| [ERD](docs/ERD.md) | 테이블 설계, 인덱스, 관계 |
| [BDD](docs/BDD.md) | 프론트엔드(Playwright) + 백엔드(Supertest) 시나리오 |
| [API](docs/API.md) | 엔드포인트 7개, 요청/응답 스키마, 에러 코드 |
