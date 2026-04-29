# API 명세서: 단순 게시판 서비스

**기준 문서:** PRD.md v1.0 · BDD.md · ERD.md · ARCHITECTURE.md  
**작성일:** 2026-04-29  
**Base URL:** `http://localhost:4000`

---

## 목차

- [공통 규칙](#공통-규칙)
- [에러 응답 형식](#에러-응답-형식)
- [에러 코드 목록](#에러-코드-목록)
- [게시글 API](#게시글-api)
- [댓글 API](#댓글-api)

---

## 공통 규칙

| 항목 | 내용 |
|---|---|
| 프로토콜 | HTTP |
| 요청 Content-Type | `application/json` |
| 응답 Content-Type | `application/json` |
| 문자 인코딩 | UTF-8 |
| 인증 | 없음 (비밀번호 기반 개별 검증) |

---

## 에러 응답 형식

모든 에러 응답은 아래 형식을 따른다.

```json
{
  "statusCode": 404,
  "code": "POST_NOT_FOUND",
  "message": "존재하지 않는 게시글입니다"
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| statusCode | number | HTTP 상태 코드 |
| code | string | 클라이언트가 분기 처리에 사용하는 식별자 |
| message | string | 사람이 읽을 수 있는 설명 |

유효성 검사 실패(400) 시 `errors` 배열이 추가된다.

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "입력값이 올바르지 않습니다",
  "errors": [
    { "field": "nickname", "message": "닉네임은 2자 이상이어야 합니다" }
  ]
}
```

---

## 에러 코드 목록

| code | HTTP | 설명 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 요청 body 유효성 검사 실패 |
| `INVALID_PASSWORD` | 403 | 비밀번호 불일치 |
| `POST_NOT_FOUND` | 404 | 게시글이 존재하지 않음 |
| `POST_DELETED` | 404 | 게시글이 소프트 삭제됨 |
| `COMMENT_NOT_FOUND` | 404 | 댓글이 존재하지 않음 |
| `COMMENT_DELETED` | 404 | 댓글이 소프트 삭제됨 |
| `RATE_LIMIT_EXCEEDED` | 429 | 분당 요청 횟수 초과 |

---

## 게시글 API

### GET /posts — 목록 조회

최신순으로 게시글 목록을 반환한다. `q` 파라미터가 있으면 제목·본문 LIKE 검색을 적용한다. `q`가 없거나 빈 값이면 전체 목록을 반환한다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| q | string | 선택 | - | 키워드 검색 (제목 + 본문) |
| page | number | 선택 | 1 | 페이지 번호 (1 이상) |

**Response 200**

```json
{
  "data": [
    {
      "id": 1,
      "title": "첫 번째 글",
      "nickname": "홍길동",
      "viewCount": 42,
      "commentCount": 3,
      "createdAt": "2026-04-29T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "totalPages": 2,
    "limit": 20
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| data[].id | number | 게시글 ID |
| data[].title | string | 제목 |
| data[].nickname | string | 작성자 닉네임 |
| data[].viewCount | number | 조회수 |
| data[].commentCount | number | 댓글 수 (삭제된 댓글 제외) |
| data[].createdAt | string | 작성 시각 (ISO 8601) |
| meta.total | number | 조건에 맞는 전체 게시글 수 |
| meta.page | number | 현재 페이지 |
| meta.totalPages | number | 전체 페이지 수 |
| meta.limit | number | 페이지당 건수 (고정 20) |

---

### GET /posts/:id — 상세 조회

게시글 상세 정보를 반환한다. 조회할 때마다 viewCount가 1 증가한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| id | number | 게시글 ID |

**Response 200**

```json
{
  "id": 1,
  "title": "첫 번째 글",
  "body": "안녕하세요",
  "nickname": "홍길동",
  "viewCount": 43,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

**Response 404 — 소프트 삭제된 게시글**

```json
{
  "statusCode": 404,
  "code": "POST_DELETED",
  "message": "삭제된 게시글입니다"
}
```

**Response 404 — 존재하지 않는 게시글**

```json
{
  "statusCode": 404,
  "code": "POST_NOT_FOUND",
  "message": "존재하지 않는 게시글입니다"
}
```

---

### POST /posts — 게시글 작성

> Rate Limit: 동일 IP 분당 5회. 초과 시 429 반환.

**Request Body**

```json
{
  "nickname": "홍길동",
  "password": "1234",
  "title": "첫 번째 글",
  "body": "안녕하세요"
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| nickname | string | Y | 2~20자 |
| password | string | Y | 4자 이상 |
| title | string | Y | 1~100자 |
| body | string | Y | 1~5,000자 |

**Response 201**

```json
{
  "id": 1,
  "title": "첫 번째 글",
  "nickname": "홍길동",
  "viewCount": 0,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

**Response 400** — 유효성 검사 실패

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "입력값이 올바르지 않습니다",
  "errors": [
    { "field": "nickname", "message": "닉네임은 2자 이상이어야 합니다" }
  ]
}
```

**Response 429** — Rate Limit 초과

```json
{
  "statusCode": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요"
}
```

---

### PATCH /posts/:id — 게시글 수정

비밀번호 검증 후 제목·본문을 수정한다. 수정하지 않을 필드는 생략 가능하다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| id | number | 게시글 ID |

**Request Body**

```json
{
  "password": "1234",
  "title": "수정된 제목",
  "body": "수정된 본문"
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| password | string | Y | - |
| title | string | 선택 | 1~100자 |
| body | string | 선택 | 1~5,000자 |

**Response 200**

```json
{
  "id": 1,
  "title": "수정된 제목",
  "body": "수정된 본문",
  "nickname": "홍길동",
  "viewCount": 5,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T11:00:00.000Z"
}
```

**Response 403** — 비밀번호 불일치

```json
{
  "statusCode": 403,
  "code": "INVALID_PASSWORD",
  "message": "비밀번호가 일치하지 않습니다"
}
```

**Response 404** — `POST_NOT_FOUND` 또는 `POST_DELETED` (위 형식 동일)

---

### DELETE /posts/:id — 게시글 삭제

비밀번호 검증 후 소프트 삭제한다. 해당 게시글의 댓글도 일괄 소프트 삭제된다 (트랜잭션).

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| id | number | 게시글 ID |

**Request Body**

```json
{
  "password": "1234"
}
```

| 필드 | 타입 | 필수 |
|---|---|---|
| password | string | Y |

**Response 200**

```json
{
  "id": 1,
  "deletedAt": "2026-04-29T11:00:00.000Z"
}
```

**Response 403** — `INVALID_PASSWORD`  
**Response 404** — `POST_NOT_FOUND` 또는 `POST_DELETED`

---

## 댓글 API

### POST /posts/:id/comments — 댓글 작성

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| id | number | 부모 게시글 ID |

**Request Body**

```json
{
  "nickname": "댓글러",
  "password": "pass",
  "body": "좋은 글이네요"
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| nickname | string | Y | 2~20자 |
| password | string | Y | 4자 이상 |
| body | string | Y | 1~500자 |

**Response 201**

```json
{
  "id": 1,
  "postId": 1,
  "nickname": "댓글러",
  "body": "좋은 글이네요",
  "createdAt": "2026-04-29T10:30:00.000Z"
}
```

**Response 400** — `VALIDATION_ERROR`  
**Response 404** — `POST_NOT_FOUND` 또는 `POST_DELETED`

---

### DELETE /posts/:postId/comments/:commentId — 댓글 삭제

비밀번호 검증 후 댓글을 소프트 삭제한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| postId | number | 부모 게시글 ID |
| commentId | number | 댓글 ID |

**Request Body**

```json
{
  "password": "pass"
}
```

| 필드 | 타입 | 필수 |
|---|---|---|
| password | string | Y |

**Response 200**

```json
{
  "id": 1,
  "deletedAt": "2026-04-29T11:00:00.000Z"
}
```

**Response 403** — `INVALID_PASSWORD`  
**Response 404** — `COMMENT_NOT_FOUND` 또는 `COMMENT_DELETED`

---

## 엔드포인트 요약

| Method | Path | 설명 | Rate Limit |
|---|---|---|---|
| GET | /posts | 게시글 목록 (검색·페이지네이션 포함) | - |
| GET | /posts/:id | 게시글 상세 (조회수 +1) | - |
| POST | /posts | 게시글 작성 | IP당 분당 5회 |
| PATCH | /posts/:id | 게시글 수정 (제목·본문) | - |
| DELETE | /posts/:id | 게시글 삭제 (cascade soft-delete) | - |
| POST | /posts/:id/comments | 댓글 작성 | - |
| DELETE | /posts/:postId/comments/:commentId | 댓글 삭제 | - |
